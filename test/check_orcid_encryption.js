const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// This script mirrors the server's encrypt/decrypt helpers to test storage
const ORCID_TOKEN_KEY = process.env.ORCID_TOKEN_KEY || null;
function getKey(){
  if(!ORCID_TOKEN_KEY) return null;
  try{ return Buffer.from(ORCID_TOKEN_KEY, 'base64'); }catch(e){ return Buffer.from(String(ORCID_TOKEN_KEY)); }
}
function encryptToken(plain){
  const key = getKey(); if(!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}
function decryptToken(blob){
  const key = getKey(); if(!key || !blob) return null;
  const data = Buffer.from(blob, 'base64');
  const iv = data.slice(0,12);
  const tag = data.slice(12,28);
  const encrypted = data.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const dec = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return dec.toString('utf8');
}

(async function(){
  try{
    const dbPath = path.resolve(__dirname, '..', 'server', 'lspp.db');
    const db = new sqlite3.Database(dbPath);

    const key = getKey();
    if(!key){
      console.error('ORCID_TOKEN_KEY not set in environment. Please set ORCID_TOKEN_KEY to a base64-encoded 32-byte key.');
      process.exit(2);
    }

    const sampleToken = 'test-access-token-' + Date.now();
    const encrypted = encryptToken(sampleToken);

    console.log('Ensuring orcid_links table exists...');
    db.run(`CREATE TABLE IF NOT EXISTS orcid_links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orcid TEXT,
      access_token TEXT,
      created INTEGER
    )`, [], (createErr) => {
      if(createErr){ console.error('Failed to create orcid_links table', createErr); process.exit(1); }
      console.log('Inserting encrypted token into orcid_links...');
      const now = Date.now();
      db.run('INSERT OR REPLACE INTO orcid_links (orcid, access_token, created) VALUES (?,?,?)', ['0000-0000-0000-0000', encrypted, now], function(err){
        if(err){ console.error('DB insert failed', err); process.exit(1); }
        console.log('Inserted, id=', this.lastID);

        db.get('SELECT * FROM orcid_links WHERE orcid = ? LIMIT 1', ['0000-0000-0000-0000'], (e,row)=>{
          if(e){ console.error('DB select failed', e); process.exit(1); }
          if(!row){ console.error('DB select returned no row after insert'); process.exit(1); }
          console.log('Row fetched:', { id: row.id, orcid: row.orcid, created: row.created });
          console.log('Stored access_token (base64 blob, truncated):', String(row.access_token).slice(0,32) + '...');
          const decrypted = decryptToken(row.access_token);
          console.log('Decrypted token:', decrypted);
          if(decrypted === sampleToken) console.log('SUCCESS: decrypted value matches original');
          else console.error('FAIL: decrypted value does not match original');
          process.exit(decrypted === sampleToken ? 0 : 3);
        });
      });
    });

  }catch(err){ console.error(err); process.exit(1); }
})();
