import { fieldType } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'

export function virtualProperties({
  propertiesListKey,
  propertyOwnerReferencePropertyKey,
}) {
  return function (meta) {
    return fieldType({
      kind: 'scalar',

      mode: 'optional',
      scalar: 'Json',
    })({
      input: {
        create: { arg: graphql.arg({ type: graphql.JSON }) },
        update: { arg: graphql.arg({ type: graphql.JSON }) },
      },
      hooks: {
        afterOperation: async ({ operation, item, context }) => {
          if (operation === 'create' || operation === 'update') {
            const propertiesValue = item[meta.fieldKey]

            await Promise.all(
              Object.entries(propertiesValue).map(
                async ([propertyKey, propertyValue]) => {
                  const type =
                    typeof propertyValue === 'number' ? 'number' : 'text'

                  console.log({
                    [propertyOwnerReferencePropertyKey]: {
                      connect: {
                        id: item.id,
                      },
                    },
                    key: propertyKey,
                    type,
                    [`value_${type}`]: propertyValue,
                  })

                  await context.query[propertiesListKey].createOne({
                    data: {
                      [propertyOwnerReferencePropertyKey]: {
                        connect: {
                          id: item.id,
                        },
                      },
                      key: propertyKey,
                      type,
                      [`value_${type}`]: propertyValue,
                    },
                  })
                },
              ),
            )
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
  }
}
