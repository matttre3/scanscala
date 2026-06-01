'use client'

import { FieldLabel, useField } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'
import { useEffect } from 'react'

const iconOptions = [
  { label: 'Fulmine', value: 'bolt' },
  { label: 'Edificio', value: 'building' },
  { label: 'Goccia', value: 'droplet' },
  { label: 'Ascensore', value: 'elevator' },
  { label: 'Chiave inglese', value: 'wrench' },
  { label: 'Fiamma', value: 'flame' },
  { label: 'Spurghi', value: 'drain' },
  { label: 'Chiave', value: 'key' },
  { label: 'Scudo', value: 'shield' },
  { label: 'Pulizie', value: 'broom' },
  { label: 'Giardino', value: 'tree' },
  { label: 'Telefono', value: 'phone' },
  { label: 'Generico', value: 'tag' },
]

const SupplierTypeIconPicker: SelectFieldClientComponent = ({ field, path }) => {
  const { setValue, value } = useField<string>({ path })
  const selectedValue = value || 'tag'

  useEffect(() => {
    if (!value) setValue('tag', true)
  }, [setValue, value])

  return (
    <div className="supplier-type-picker">
      <FieldLabel label={field.label || 'Icona'} path={path} required={field.required} />
      <div className="supplier-type-picker__grid supplier-type-picker__grid--icons">
        {iconOptions.map((option) => {
          const isSelected = selectedValue === option.value

          return (
            <button
              aria-pressed={isSelected}
              className="supplier-type-picker__icon-option"
              data-selected={isSelected}
              key={option.value}
              onClick={() => setValue(option.value)}
              type="button"
            >
              <span className="supplier-type-picker__icon">
                <PickerIcon iconName={option.value} />
              </span>
              <span className="supplier-type-picker__label">{option.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SupplierTypeIconPicker

function PickerIcon({ iconName }: { iconName: string }) {
  switch (iconName) {
    case 'bolt':
      return <IconPath d="M13 2L5 13h5l-1 9 8-11h-5l1-9z" />
    case 'building':
      return <IconPath d="M4 21h16M6 21V6h8M10 6V3M10 9h6M16 9v4m0 0h2m-2 0l-2 4" />
    case 'droplet':
      return <IconPath d="M12 3s6 6.5 6 10a6 6 0 11-12 0c0-3.5 6-10 6-10zm-2 10a2 2 0 002 2" />
    case 'elevator':
      return <IconPath d="M6 3h12v18H6V3zm4 6l2-2 2 2m-4 6l2 2 2-2" />
    case 'wrench':
      return <IconPath d="M14 7a4 4 0 005 5l-8 8a2 2 0 11-3-3l8-8a4 4 0 01-2-2z" />
    case 'flame':
      return <IconPath d="M12 3s4 3 4 7a4 4 0 01-8 0c0-2 1-4 4-7zm0 7c3 2 5 4 5 7a5 5 0 11-10 0c0-3 2-5 5-7z" />
    case 'drain':
      return <IconPath d="M4 8h16M6 8l2 10h8l2-10M10 12h4m-3 3h2" />
    case 'key':
      return <IconPath d="M14 14l6-6m-2 0h2v2m-9 4a4 4 0 11-5.7-5.7A4 4 0 0111 14z" />
    case 'shield':
      return <IconPath d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3zm0 6a2 2 0 100 4 2 2 0 000-4zm-3 8a3 3 0 016 0" />
    case 'broom':
      return <IconPath d="M16 3l5 5M14 5l5 5M13 8l3 3-8 9H4l9-12zm-5 12l-4-4m2 2l3-3" />
    case 'tree':
      return <IconPath d="M12 21v-6M8 17h8M12 3l5 7h-3l4 5H6l4-5H7l5-7z" />
    case 'phone':
      return <IconPath d="M4 5.5c0-.83.67-1.5 1.5-1.5h2.1c.64 0 1.2.4 1.42 1.01l.8 2.22c.2.56.05 1.18-.38 1.59l-1.12 1.07a13.2 13.2 0 006.91 6.91l1.07-1.12c.41-.43 1.03-.58 1.59-.38l2.22.8c.61.22 1.01.78 1.01 1.42v2.1c0 .83-.67 1.5-1.5 1.5H18c-7.73 0-14-6.27-14-14V5.5z" />
    default:
      return <IconPath d="M3 10V4h6l9 9-6 6-9-9zm4-3a1 1 0 100 2 1 1 0 000-2z" />
  }
}

function IconPath({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  )
}
