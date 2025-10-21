(async ()=>{
  try{
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3010';
    const resp = await fetch(base + '/orcid/connect', { redirect: 'manual' });
    console.log('status', resp.status);
    const loc = resp.headers.get('location');
    console.log('location', loc);
    if(resp.status !== 302) process.exit(2);
    if(!loc || !loc.includes('client_id=')) process.exit(3);
    console.log('OK');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
