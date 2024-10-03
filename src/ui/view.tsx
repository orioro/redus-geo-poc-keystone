import React from 'react'
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
} from '@keystone-ui/fields'
import { CellLink, CellContainer } from '@keystone-6/core/admin-ui/components'

import {
  type CardValueComponent,
  type CellComponent,
  type FieldController,
  type FieldControllerConfig,
} from '@keystone-6/core/types'

const ValueDisplay = ({ value }) => (
  <div
    style={{
      maxHeight: '50vh',
      overflow: 'auto',
      backgroundColor: '#fafbfc',
      border: '#e1e5e9',
      borderRadius: '4px',
      padding: '10px',
    }}
  >
    <code style={{ whiteSpace: 'pre-wrap', fontSize: '.8rem' }}>
      {JSON.stringify(value, null, '  ')}
    </code>
  </div>
)

export const Field = ({
  field,
  forceValidation,
  value,
  onChange,
  autoFocus,
}) => {
  return (
    <FieldContainer>
      <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
      <FieldDescription id={`${field.path}-description`}>
        {field.description}
      </FieldDescription>
      <ValueDisplay value={value} />
    </FieldContainer>
  )
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path]
  return linkTo ? (
    <CellLink {...linkTo}>
      <ValueDisplay value={value} />
    </CellLink>
  ) : (
    <CellContainer>
      <ValueDisplay value={value} />
    </CellContainer>
  )
}
Cell.supportsLinkTo = true

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  )
}

export const controller = (
  config: FieldControllerConfig<{
    graphqlSelection: string
  }>,
): FieldController<string | null, string> => {
  return {
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: `${config.path}${config.fieldMeta?.graphqlSelection || ''}`,
    defaultValue: null,
    deserialize: (data) => data[config.path],
    serialize: (value) => ({ [config.path]: value }),
  }
}
