import * as migration_20260601_175838_add_supplier_type_collection from './20260601_175838_add_supplier_type_collection';
import * as migration_20260601_223639_make_supplier_legacy_type_nullable from './20260601_223639_make_supplier_legacy_type_nullable';

export const migrations = [
  {
    up: migration_20260601_175838_add_supplier_type_collection.up,
    down: migration_20260601_175838_add_supplier_type_collection.down,
    name: '20260601_175838_add_supplier_type_collection'
  },
  {
    up: migration_20260601_223639_make_supplier_legacy_type_nullable.up,
    down: migration_20260601_223639_make_supplier_legacy_type_nullable.down,
    name: '20260601_223639_make_supplier_legacy_type_nullable'
  },
];
