'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

const colorOptions = [
  { label: 'Verde', value: 'emerald' },
  { label: 'Ambra', value: 'amber' },
  { label: 'Blu', value: 'blue' },
  { label: 'Viola', value: 'violet' },
  { label: 'Rosso', value: 'red' },
  { label: 'Azzurro', value: 'sky' },
  { label: 'Grigio', value: 'slate' },
  { label: 'Arancio', value: 'orange' },
  { label: 'Teal', value: 'teal' },
]

const SupplierTypeColorPicker: SelectFieldClientComponent = ({ field, path }) => {
  const { setValue, value } = useField<string>({ path })
  const selectedValue = value || 'emerald'

  return (
    <div className="supplier-type-picker">
      <FieldLabel label={field.label || 'Colore'} path={path} required={field.required} />
      <div className="supplier-type-picker__grid supplier-type-picker__grid--colors">
        {colorOptions.map((option) => {
          const isSelected = selectedValue === option.value

          return (
            <button
              aria-pressed={isSelected}
              className="supplier-type-picker__color-option"
              data-color={option.value}
              data-selected={isSelected}
              key={option.value}
              onClick={() => setValue(option.value)}
              type="button"
            >
              <span className="supplier-type-picker__swatch" />
              <span className="supplier-type-picker__label">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SupplierTypeColorPicker
