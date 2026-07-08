SELECT
  id,
  name,
  category,
  quantity,
  unit,
  status,
  owner_name
FROM app_pantry__items
WHERE status != 'ok'
ORDER BY status DESC, name ASC
LIMIT 500
