import * as migration_20260601_175838_add_supplier_type_collection from './20260601_175838_add_supplier_type_collection';

export const migrations = [
  {
    up: migration_20260601_175838_add_supplier_type_collection.up,
    down: migration_20260601_175838_add_supplier_type_collection.down,
    name: '20260601_175838_add_supplier_type_collection'
  },
];
