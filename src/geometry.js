import { fieldType, orderDirectionEnum } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'

export const geometry =
  ({ isIndexed, ...config } = {}) =>
  (meta) =>
    fieldType({
      kind: 'multi',
      fields: {
        geometry: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'Unsupported("geometry")',
          //
          // Index should be created manually in a migration sql file
          // so that it contains the correct index details
          //
          // index: 'index',
          //
        },
        json: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'Json',
        },
      },
      // index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: graphql.JSON }) },
        update: { arg: graphql.arg({ type: graphql.JSON }) },
      },
      hooks: {
        resolveInput: async ({ operation, resolvedData, fieldKey }) => {
          console.log('resolveInput', operation, resolvedData[fieldKey])
          return {
            //
            // The workflow is:
            //
            // 1. Upon create/update, data will be stored in the json storage
            // 2. After the data will be transferred to the geometry field via
            //    custom SQL query
            //
            geometry: undefined,
            json: {
              value: resolvedData[fieldKey],
            },
          }
        },
        afterOperation: async ({ operation, item, context }) => {
          if (operation === 'update' || operation === 'delete') {
            console.log('afterOperation', item)
          }
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
