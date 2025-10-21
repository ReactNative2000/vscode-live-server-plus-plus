const port = process.env.PORT || 3010;
// use global fetch available in Node 18+
const base = `http://127.0.0.1:${port}`;

(async ()=>{
  try{
    const res = await fetch(base + '/character/vampire');
    console.log('/character/vampire status', res.status);
    const j = await res.json().catch(()=>null);
    if(res.status !== 200) process.exit(2);
    if(!j || j.name !== 'Vampire'){
      console.error('unexpected payload', j);
      process.exit(3);
    }
    console.log('vampire endpoint OK');
    process.exit(0);
  }catch(e){ console.error('check failed', e && e.message); process.exit(1); }
})();
