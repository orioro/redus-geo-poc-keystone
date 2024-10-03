import { fieldType, orderDirectionEnum } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'

export const geometry =
  ({ isIndexed, ...config } = {}) =>
  (meta) =>
    fieldType({
      kind: 'multi',
      fields: {
        [meta.fieldKey]: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'Unsupported("geometry")',
        },
        [`${meta.fieldKey}_json`]: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'Json',
        },
      },
      // index: isIndexed === true ? 'index' : isIndexed || undefined,
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: graphql.Int }) },
        update: { arg: graphql.arg({ type: graphql.Int }) },
        orderBy: { arg: graphql.arg({ type: orderDirectionEnum }) },
      },
      hooks: {
        resolveInput: async ({ operation, resolvedData, fieldKey }) => {
          console.log('resolveInput', operation, resolvedData[fieldKey])
          return {
            [meta.fieldKey]: undefined,
            [`${meta.fieldKey}_json`]: {
              value: resolvedData[fieldKey],
            },
          }
        },
        afterOperation: async ({ op, item }) => {
          console.log('afterOperation', item)
        },
      },
      output: graphql.field({ type: graphql.Int }),
      views: './src/ui/view',
    })
