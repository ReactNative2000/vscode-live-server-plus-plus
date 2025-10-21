(async ()=>{
  try{
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3010';
    const endpoints = ['/character/god','/character/satan'];
    for(const e of endpoints){
      const resp = await fetch(base + e);
      console.log(e, 'status', resp.status);
      if(resp.status !== 200) process.exit(2);
      const j = await resp.json();
      if(!j.name){ console.error('missing name for', e); process.exit(3); }
      console.log('name', j.name);
    }
    console.log('OK');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
