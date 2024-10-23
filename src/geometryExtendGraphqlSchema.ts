// import { list } from '@keystone-6/core'
import type { GraphQLSchema } from 'graphql'
import { mergeSchemas } from '@graphql-tools/schema'
import { arg } from '@keystone-6/core/dist/declarations/src/types/schema/graphql-ts-schema'
import booleanValid from '@turf/boolean-valid'

import Prisma from '@prisma/client'

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
        geometrySum(
          containerGeometry: JSON!
          propertyKey: String!
        ):JSON
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
                properties,
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

            return {
              length: results.length,
              results,
            }
          },
          geometrySum: async (
            root,
            { containerGeometry, propertyKey },
            context,
          ) => {
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
                SUM(
                  COALESCE(
                    (${SQL_SAFE.TABLE_KEY}.properties->> ${propertyKey})::NUMERIC,
                    0
                  )
                  *
                  ST_Area(
                    ST_Intersection(
                      ${SQL_SAFE.TABLE_KEY}.${SQL_SAFE.GEOMETRY_COLUMN_KEY},
                      ST_SetSRID(
                        ST_GeomFromGeoJSON(
                          ${JSON.stringify(containerGeometry)}
                        ),
                        ${srid}::INTEGER
                      )
                    )
                  ) 
                  /
                  ST_Area(${SQL_SAFE.TABLE_KEY}.${SQL_SAFE.GEOMETRY_COLUMN_KEY})
                )
              FROM ${SQL_SAFE.TABLE_KEY}
              WHERE
                ST_Intersects(
                  ST_SetSRID(
                    ST_GeomFromGeoJSON(
                      ${JSON.stringify(containerGeometry)}
                    ),
                    ${srid}::INTEGER
                  ),
                  ${SQL_SAFE.GEOMETRY_COLUMN_KEY}
                )
            `

            return results[0]
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
