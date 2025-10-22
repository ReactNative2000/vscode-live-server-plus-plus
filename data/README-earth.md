This folder contains simple "earth" geometry files for demos and tests.

Files:

- `earth.geojson` — GeoJSON FeatureCollection with a single Polygon covering the world bbox [-180, -90, 180, 90]. Good for quick mapping demos or tests.
- `earth.kml` — KML version of the same polygon for Google Earth or KML-compatible tools.
- `earth.topojson` — Minimal TopoJSON topology with one polygon (suitable for small demos; not intended as production-quality topojson).

Notes:
- These files are intentionally small and approximate. If you want country boundaries or higher-resolution data, I can add Natural Earth sets (requires a larger file and possibly compression).
- Usage examples:
  - Leaflet: L.geoJSON(fetch('data/earth.geojson').then(r=>r.json())).addTo(map)
  - Google Earth: open `data/earth.kml`

If you'd like me to add Natural Earth or convert to other formats (Shapefile, MBTiles), tell me which scale/area you need and I’ll add it.
