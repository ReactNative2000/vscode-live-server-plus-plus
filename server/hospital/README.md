# Hospital API (demo)

Run the hospital API (dev):

```bash
cd server/hospital
npm install
node index.js
```

By default the server listens on port 4001. Use the admin UI at `/docs/hospital/admin/index.html` (served by your static server) to import JSON into the running API.

## Security & tests

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
<<<<<<< HEAD
<<<<<<< HEAD
=======
```
>>>>>>> 797e098 (chore(docs/ci): fix markdown lint issues and clean CI workflows)
# Hospital API (demo)

Run the hospital API (dev):

```bash
cd server/hospital
npm install
node index.js
```

By default the server listens on port 4001. Use the admin UI at `/docs/hospital/admin/index.html` (served by your static server) to import JSON into the running API.

<<<<<<< HEAD
## Security & tests
=======
Security & tests
-----------------
>>>>>>> 797e098 (chore(docs/ci): fix markdown lint issues and clean CI workflows)

The server supports an optional ADMIN_TOKEN environment variable. If you set `ADMIN_TOKEN`, admin routes (`/api/items/import` and `/api/items/:sku/adjust`) require a Bearer token header matching that value. Example:

```bash
export ADMIN_TOKEN=mysupersecret
curl -H "Authorization: Bearer mysupersecret" -X POST http://localhost:4001/api/items/import -d @data/hospital_stock.json -H 'Content-Type: application/json'
```

Run tests (requires dev dependencies):

```bash
cd server/hospital
npm install
=======
>>>>>>> ce53a0c (ci(lighthouse): replace corrupted workflow; fix ts compile; add tsconfig and cors dep for hospital server)
# Hospital API (demo)

Run the hospital API (dev):

```bash
cd server/hospital
npm install
node index.js
```

By default the server listens on port 4001. Use the admin UI at `/docs/hospital/admin/index.html` (served by your static server) to import JSON into the running API.

## Security & tests

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


