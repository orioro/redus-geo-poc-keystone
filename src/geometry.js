import { fieldType } from '@keystone-6/core/types'
import { graphql } from '@keystone-6/core'
import booleanValid from '@turf/boolean-valid'

import Prisma from '@prisma/client'

function dbFieldKeys(fieldKey) {
  return {
    geoJson: `${fieldKey}_geoJson`,
    geometry: `${fieldKey}_geometry`,
  }
}

const DEFAULT_SRID = 4326

const VALID_GEOMETRY_TYPES = [
  'Point',
  'MultiPoint',
  'LineString',
  'MultiLineString',
  'Polygon',
  'MultiPolygon',
  'GeometryCollection',
]

const DB_KEY_RE = /[_a-zA-Z0-9]+/

function validateDbKey(str) {
  if (!DB_KEY_RE.test(str)) {
    throw new Error(`Invalid db key: ${str}`)
  }
}

export const geometry =
  ({
    acceptGeometryTypes = VALID_GEOMETRY_TYPES,
    srid = DEFAULT_SRID,
    ...config
  } = {}) =>
  (meta) => {
    //
    // Validate listKey and fieldKey
    //
    validateDbKey(meta.listKey)
    validateDbKey(meta.fieldKey)

    const DB_KEYS = dbFieldKeys(meta.fieldKey)

    if (
      !acceptGeometryTypes.every((type) => VALID_GEOMETRY_TYPES.includes(type))
    ) {
      throw new Error(
        `Invalid acceptGeometryType: ${acceptGeometryTypes.find((type) => !VALID_GEOMETRY_TYPES.includes(type))}`,
      )
    }

    //
    // Variables that are safe to use in raw sql queries.
    // These values are defined at the highest level in
    // order to ensure they cannot be affected by unsafe user input
    // (usually available on hooks)
    //
    // Calls to Prisma.raw should be kept here as well, so as to
    // avoid any errors that might allow wrapping unsafe content
    // in Prisma.raw(input)
    //
    // See discussion at:
    // https://github.com/prisma/prisma/issues/9765#issuecomment-1020391857
    //
    const SQL_SAFE = {
      TABLE_KEY: Prisma.raw(`"${meta.listKey}"`),
      GEOMETRY_COLUMN_KEY: Prisma.raw(DB_KEYS.geometry),
    }

    function isValidGeoJson(input) {
      return acceptGeometryTypes.includes(input?.type) && booleanValid(input)
    }

    return fieldType({
      kind: 'multi',
      fields: {
        geometry: {
          kind: 'scalar',
          mode: 'optional',
          scalar: `Unsupported("GEOMETRY(Geometry, ${srid})")`,
          //
          // Index should be created manually in a migration sql file
          // so that it contains the correct index details
          //
          // Index of the correct type should be set manually on the migration
          // sql file
          //
          // See:
          // https://github.com/prisma/prisma/discussions/6677
          // https://github.com/prisma/prisma/issues/7515
          //
          index: 'index',
        },
        geoJson: {
          kind: 'scalar',
          mode: 'optional',
          scalar: 'Json',
        },
      },
    })({
      ...config,
      input: {
        create: { arg: graphql.arg({ type: graphql.JSON }) },
        update: { arg: graphql.arg({ type: graphql.JSON }) },
      },
      hooks: {
        resolveInput: async ({ resolvedData, fieldKey }) => {
          const inputValue = resolvedData[fieldKey]

          if (typeof inputValue === 'undefined') {
            return undefined
          }

          return {
            //
            // The workflow is:
            //
            // 1. Upon create/update, data will be stored in the geoJson storage
            // 2. After the data will be transferred to the geometry field via
            //    custom SQL query
            //
            geometry: undefined,
            geoJson: inputValue === null ? null : inputValue,
          }
        },
        validateInput: async ({
          operation,
          resolvedData,
          fieldKey,
          addValidationError,
        }) => {
          const geoJsonInput = resolvedData[fieldKey]?.geoJson

          if (geoJsonInput !== null && typeof geoJsonInput !== 'undefined') {
            //
            // Verify if the provided geoJson is valid and adheres to provided list
            // of accept types
            //
            if (!isValidGeoJson(geoJsonInput)) {
              addValidationError('Invalid GeoJSON')
            }
          }
        },
        afterOperation: async ({ operation, item, context }) => {
          if (operation === 'update' || operation === 'create') {
            const geoJsonInput = item[DB_KEYS.geoJson]

            if (geoJsonInput === null || typeof geoJsonInput === 'undefined') {
              await context.prisma.$executeRaw`
                UPDATE ${SQL_SAFE.TABLE_KEY}
                SET ${SQL_SAFE.GEOMETRY_COLUMN_KEY} = null
                WHERE id = ${item.id}::uuid
              `
            } else {
              if (!isValidGeoJson(geoJsonInput)) {
                throw new Error('Invalid GeoJSON')
              }

              await context.prisma.$executeRaw`
                UPDATE ${SQL_SAFE.TABLE_KEY}
                SET
                  ${SQL_SAFE.GEOMETRY_COLUMN_KEY} = ST_SetSRID(
                    ST_GeomFromGeoJSON(
                      ${JSON.stringify(geoJsonInput)}
                    ),
                    ${srid}::INTEGER
                  )
                WHERE id = ${item.id}::UUID
              `
            }
          }
        },
      },
      output: graphql.field({
        type: graphql.JSON,
        resolve: async ({ item }) => {
          return item[DB_KEYS.geoJson]
        },
      }),
      views: './src/ui/view',
    })
  }

export function extendGraphqlGeometryQuery({ listKey, fieldKeys }) {
  return function (schema) {}
}
