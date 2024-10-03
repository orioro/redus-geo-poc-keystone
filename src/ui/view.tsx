// view.tsx

import { FieldController, FieldControllerConfig } from '@keystone-6/core/types'

import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields'
import { FieldProps } from '@keystone-6/core/types'


import { CellLink, CellContainer } from '@keystone-6/core/admin-ui/components';
import { CellComponent } from '@keystone-6/core/types';

// view.tsx

import { CardValueComponent } from '@keystone-6/core/types';

export const controller = (
  config: FieldControllerConfig,
): FieldController<string, string> => {
  return {
    path: config.path,
    label: config.label,
    graphqlSelection: config.path,
    defaultValue: '',
    deserialize: (data) => {
      const value = data[config.path]
      return typeof value === 'number' ? value + '' : ''
    },
    serialize: (value) => ({
      [config.path]: value === '' ? null : parseInt(value, 10),
    }),
  }
}

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => (
  <FieldContainer>
    <FieldLabel htmlFor={field.path}>{field.label}</FieldLabel>
    {onChange ? (
      <TextInput
        id={field.path}
        autoFocus={autoFocus}
        type="number"
        onChange={(event) => {
          onChange(event.target.value.replace(/[^\d-]/g, ''))
        }}
        value={value}
      />
    ) : (
      value
    )}
  </FieldContainer>
)

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  let value = item[field.path] + '';
  return linkTo ? <CellLink {...linkTo}>{value}</CellLink> : <CellContainer>{value}</CellContainer>;
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};