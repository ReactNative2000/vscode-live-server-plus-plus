(async ()=>{
  try{
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3010';
    const resp = await fetch(base + '/character/man');
    console.log('/character/man', 'status', resp.status);
    if(resp.status !== 200) process.exit(2);
    const j = await resp.json();
    if(!j.name || j.name !== 'The Man') { console.error('unexpected name', j.name); process.exit(3); }
    console.log('OK');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
