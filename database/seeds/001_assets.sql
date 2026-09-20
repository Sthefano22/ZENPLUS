
INSERT INTO core.parties (id, party_type, created_at, updated_at)
VALUES ('b5f7e71e-3f53-4b48-bc23-a1c1d9b97001', 'ORGANIZATION', NOW(), NOW())
ON CONFLICT DO NOTHING;

INSERT INTO core.organizations (party_id, legal_name, trade_name, tax_id)
VALUES ('b5f7e71e-3f53-4b48-bc23-a1c1d9b97001', 'ZENPLUS Desarrollo Inmobiliario SAC', 'ZENPLUS Desarrollo Inmobiliario', '20123456789')
ON CONFLICT DO NOTHING;

INSERT INTO inventory.assets (code, name, description, asset_type, status, area_m2, currency, current_price, owner_party_id)
VALUES
  ('DEP-ZN-101', 'Departamento 101 - Edificio Vista', 'Departamento flat de 3 habitaciones con vista al parque', 'APARTMENT', 'AVAILABLE', 85.5, 'USD', 95000, 'b5f7e71e-3f53-4b48-bc23-a1c1d9b97001'),
  ('LOT-N3-003', 'Lote Residencial N92', 'Ubicación cerca al colegio', 'LOT', 'AVAILABLE', 120.34, 'USD', 344555, 'b5f7e71e-3f53-4b48-bc23-a1c1d9b97001')
ON CONFLICT (code) DO NOTHING;
