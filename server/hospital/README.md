# Hospital API (demo)

Run the hospital API (dev):

```bash
cd server/hospital
npm install
node index.js
```

By default the server listens on port 4001. Use the admin UI at `/docs/hospital/admin/index.html` (served by your static server) to import JSON into the running API.

Security & tests
-----------------

The server supports an optional ADMIN_TOKEN environment variable. If you set `ADMIN_TOKEN`, admin routes (`/api/items/import` and `/api/items/:sku/adjust`) require a Bearer token header matching that value. Example:

```bash
export ADMIN_TOKEN=mysupersecret
curl -H "Authorization: Bearer mysupersecret" -X POST http://localhost:4001/api/items/import -d @data/hospital_stock.json -H 'Content-Type: application/json'
```

Run tests (requires dev dependencies):

```bash
cd server/hospital
npm install
npm test
```

