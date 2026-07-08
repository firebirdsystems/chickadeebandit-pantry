SELECT
  id,
  name,
  category,
  quantity,
  unit,
  expiry_date
FROM app_pantry__items
WHERE expiry_date != ''
ORDER BY expiry_date ASC
LIMIT 500
