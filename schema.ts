// Welcome to your schema
//   Schema driven development is Keystone's modus operandi
//
// This file is where we define the lists, fields and hooks for our data.
// If you want to learn more about how lists are configured, please read
// - https://keystonejs.com/docs/config/lists

import { graphql, list } from '@keystone-6/core'
import { allowAll } from '@keystone-6/core/access'
import { geometry } from './src/geometry'
import { virtualProperties } from './src/virtualProperties'
import { queryableJson } from './src/queryableJson'

// see https://keystonejs.com/docs/fields/overview for the full list of fields
//   this is a few common fields for an example
import {
  text,
  relationship,
  password,
  timestamp,
  select,
  json,
  float,
  virtual,
} from '@keystone-6/core/fields'

// the document field is a more complicated field, so it has it's own package
import { document } from '@keystone-6/fields-document'
// if you want to make your own fields, see https://keystonejs.com/docs/guides/custom-fields

// when using Typescript, you can refine your types to a stricter subset by importing
// the generated types from '.keystone/types'
import { type Lists } from '.keystone/types'

export const lists = {
  //
  // Using KeyValue_ model for property storage
  //
  KeyValue_MapLayer: list({
    access: allowAll,
    fields: {
      name: text(),
      description: json(),
      featurePropertySchema: json(),
      parentMapLayer: relationship({
        ref: 'KeyValue_MapLayer',
        many: false,
      }),
      features: relationship({
        ref: 'KeyValue_MapFeature.mapLayer',
        many: true,
      }),
    },
  }),

  KeyValue_MapFeature: list({
    access: allowAll,
    fields: {
      mapLayer: relationship({
        ref: 'KeyValue_MapLayer.features',
        many: false,
      }),
      name: text(),
      geometry: geometry(),
      properties: virtualProperties({
        propertiesListKey: 'KeyValue_MapFeatureProperty',
        propertyOwnerReferencePropertyKey: 'mapFeature',
      }),
    },
  }),

  KeyValue_MapFeatureProperty: list({
    access: allowAll,
    fields: {
      mapFeature: relationship({
        ref: 'KeyValue_MapFeature',
        many: false,
      }),
      key: text({
        validation: {
          isRequired: true,
        },
      }),

      type: select({
        options: [
          {
            label: 'Text',
            value: 'text',
          },
          {
            label: 'Number',
            value: 'number',
          },
        ],
      }),

      value_text: text(),
      value_number: float(),
    },
  }),

  //
  // Using Json model for property storage
  //
  Json_MapLayer: list({
    access: allowAll,
    fields: {
      name: text(),
      description: json(),
      featurePropertySchema: json(),
      parentMapLayer: relationship({
        ref: 'Json_MapLayer',
        many: false,
      }),
      features: relationship({
        ref: 'Json_MapFeature.mapLayer',
        many: true,
      }),
    },
  }),

  Json_MapFeature: list({
    access: allowAll,
    fields: {
      mapLayer: relationship({
        ref: 'Json_MapLayer.features',
        many: false,
      }),
      name: text({
        isIndexed: true,
      }),
      geometry: geometry(),
      properties: queryableJson({}),
    },
  }),
} satisfies Lists
