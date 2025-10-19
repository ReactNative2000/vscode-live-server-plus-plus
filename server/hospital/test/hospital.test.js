const path = require('path');
const fs = require('fs');
const expect = require('chai').expect;
const request = require('supertest');

const appPath = path.resolve(__dirname, '..', 'index.js');

// index.js starts the server when required; to avoid multiple listeners
// we will spawn it in a child process-like manner by requiring and
// connecting to localhost:PORT (default 4001). The server logs a line on start.

describe('Hospital API (basic)', function() {
  const PORT = process.env.PORT || 4001;
  const base = `http://localhost:${PORT}`;

  let serverProcessStarted = false;

  before(function(done) {
    // ensure db.json exists (seed may have been run)
    const dbJson = path.resolve(__dirname, '..', 'db.json');
    if (!fs.existsSync(dbJson)) {
      // create an empty DB so endpoints return array
      fs.writeFileSync(dbJson, JSON.stringify([], null, 2));
    }

    // require the server file to start the app
    // eslint-disable-next-line global-require
    require(appPath);
    // give the server a moment to start
    setTimeout(() => { serverProcessStarted = true; done(); }, 250);
  });

  it('GET /api/items returns an array', async function() {
    const res = await request(base).get('/api/items').expect(200);
    expect(res.body).to.be.an('array');
  });

  it('POST /api/items/import is protected without ADMIN_TOKEN or rejects unauthorized', async function() {
    // without ADMIN_TOKEN env set, requireAdmin allows access in demo mode
    const payload = [{ sku: 'T-TEST-1', name: 'Test Item', quantity: 5 }];
    const res = await request(base).post('/api/items/import').send(payload).expect(200);
    expect(res.body).to.have.property('imported');
  });

  it('POST /api/items/:sku/adjust adjusts quantity and 404s when missing', async function() {
    // import one item first
    const payload = [{ sku: 'T-ADJ-1', name: 'Adjust Item', quantity: 3 }];
    await request(base).post('/api/items/import').send(payload).expect(200);
    // increase by 2
    const up = await request(base).post('/api/items/T-ADJ-1/adjust').send({ delta: 2 }).expect(200);
    expect(up.body).to.have.property('quantity').that.is.a('number');
    // adjust missing SKU
    await request(base).post('/api/items/NON-EXISTENT/adjust').send({ delta: 1 }).expect(404);
  });

  it('admin endpoints enforce ADMIN_TOKEN when set', async function() {
    // set an invalid token header
    process.env.ADMIN_TOKEN = 'test-token-xyz';
    // without Authorization header we should get 401
    await request(base).post('/api/items/import').send([{ sku: 'X', name: 'x' }]).expect(401);
    // with wrong token
    await request(base).post('/api/items/import').set('Authorization', 'Bearer nope').send([{ sku: 'X', name: 'x' }]).expect(401);
    // with correct token
    const res = await request(base).post('/api/items/import').set('Authorization', 'Bearer test-token-xyz').send([{ sku: 'X', name: 'x' }]).expect(200);
    expect(res.body).to.have.property('imported');
  });

});
