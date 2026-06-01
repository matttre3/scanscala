type SupplierTypeRelationship =
  | {
      color?: null | string
      icon?: null | string
      nome?: null | string
    }
  | null
  | number
  | undefined

type SupplierWithType = {
  tipologia?: SupplierTypeRelationship
  type?: null | string
}

const legacyTypeDefaults: Record<string, { color: string; icon: string }> = {
  Elettricista: { icon: 'bolt', color: 'amber' },
  'Impresa Edile': { icon: 'building', color: 'orange' },
  Idraulico: { icon: 'droplet', color: 'blue' },
  Ascensorista: { icon: 'elevator', color: 'violet' },
  Manutentore: { icon: 'wrench', color: 'emerald' },
  Caldaista: { icon: 'flame', color: 'red' },
  Spurghi: { icon: 'drain', color: 'sky' },
  Fabbro: { icon: 'key', color: 'slate' },
  Amministratore: { icon: 'shield', color: 'teal' },
}

export function getSupplierTypeDisplay(supplier: SupplierWithType) {
  const relationship = typeof supplier.tipologia === 'object' ? supplier.tipologia : null
  const legacyType = supplier.type || null
  const name = relationship?.nome || legacyType || 'Tipo non disponibile'
  const legacyDefaults = legacyType ? legacyTypeDefaults[legacyType] : null

  return {
    color: relationship?.color || legacyDefaults?.color || 'emerald',
    icon: relationship?.icon || legacyDefaults?.icon || 'tag',
    name,
  }
}
