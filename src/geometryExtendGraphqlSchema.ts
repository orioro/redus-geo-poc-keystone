// import { list } from '@keystone-6/core'
import type { GraphQLSchema } from 'graphql'
import { mergeSchemas } from '@graphql-tools/schema'
import { arg } from '@keystone-6/core/dist/declarations/src/types/schema/graphql-ts-schema'
import booleanValid from '@turf/boolean-valid'

import Prisma from '@prisma/client'

// import { allowAll } from '@keystone-6/core/access'
// import { select, relationship, text, timestamp } from '@keystone-6/core/fields'

// const q = `
//       type Query {
//         """ Return all posts for a user from the last <seconds> seconds """
//         """ recentPosts(id: ID!, seconds: Int! = 600): [Post] """

//         """ Compute statistics for a user """
//         """ stats(id: ID!): Statistics """
//       }

//       """ A custom type to represent statistics for a user """
//       type Statistics {
//         draft: Int
//         published: Int
//         latest: Post
//       }
//     `

function isValidGeoJson(input: any): boolean {
  return booleanValid(input)
}

const DEFAULT_SRID = 4326

export function geometryExtendGraphqlSchema({
  listKey,
  geometryFieldKey,
  srid = DEFAULT_SRID,
}: {
  listKey: string
  geometryFieldKey: string
  srid?: number
}) {
  const SQL_SAFE = {
    TABLE_KEY: Prisma.raw(`"${listKey}"`),
    GEOJSON_COLUMN_KEY: Prisma.raw(`"${geometryFieldKey}_geoJson"`),
    GEOMETRY_COLUMN_KEY: Prisma.raw(`"${geometryFieldKey}_geometry"`),
  }

  return function (baseSchema: GraphQLSchema) {
    return mergeSchemas({
      schemas: [baseSchema],
      typeDefs: `
      type Query {
        """ stats(id: ID!): Statistics """
        geometryQuery(containerGeometry: JSON!): JSON
      }
    `,
      resolvers: {
        Query: {
          geometryQuery: async (root, { containerGeometry }, context) => {
            //
            // 1. Validate containerGeometry
            //
            if (!isValidGeoJson(containerGeometry)) {
              throw new Error(
                `Invalid containerGeometry ${JSON.stringify(containerGeometry)}`,
              )
            }

            const results = await context.prisma.$queryRaw`
              SELECT
                id,
                ${SQL_SAFE.GEOJSON_COLUMN_KEY}
              FROM ${SQL_SAFE.TABLE_KEY}
              WHERE
                ST_Contains(
                  ST_SetSRID(
                    ST_GeomFromGeoJSON(
                      ${JSON.stringify(containerGeometry)}
                    ),
                    ${srid}::INTEGER
                  ),
                  ${SQL_SAFE.GEOMETRY_COLUMN_KEY}
                )
            `

            return results
          },
          // recentPosts: (root, { id, seconds }, context: Context) => {
          //   const cutoff = new Date(Date.now() - seconds * 1000)

          //   // Note we use `context.db.Post` here as we have a return type
          //   // of [Post], and this API provides results in the correct format.
          //   // If you accidentally use `context.query.Post` here you can expect problems
          //   // when accessing the fields in your GraphQL client.
          //   return context.db.Post.findMany({
          //     where: {
          //       author: { id: { equals: id } },
          //       publishDate: { gt: cutoff },
          //     },
          //   })
          // },
          // stats: async (root, { id }) => {
          //   return { authorId: id }
          // },
        },
      },
    })
  }
}
