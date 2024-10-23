import { fieldType } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'

export function queryableJson({} = {}) {
  return function (meta) {
    return fieldType({
      kind: 'scalar',

      mode: 'optional',
      scalar: 'Json',

      index: 'index',
      extendPrismaSchema: (schema) => {
        // return schema
        return schema.replace(/(\@\@index\([^)]+)\)/, '$1, type: Gin)')
      },
    })({
      input: {
        create: { arg: graphql.arg({ type: graphql.JSON }) },
        update: { arg: graphql.arg({ type: graphql.JSON }) },
        where: {
          arg: graphql.arg({ type: graphql.JSON }),
          resolve: async (arg, context) => {
            if (typeof arg !== 'object') {
              return undefined
            }

            const queryEntries = Object.entries(arg)

            return {
              AND: queryEntries.map(([key, value]) => ({
                path: [key],
                equals: value,
              })),
            }

            // return {
            //   // AND:
            //   path: ['tipo_equipamento'],
            //   equals: 'Hospital',
            // }
          },
        },
      },
      output: graphql.field({
        type: graphql.JSON,
        resolve: async ({ item }) => {
          return item[meta.fieldKey]
        },
      }),
      views: './src/ui/view',
    })
  }
}
