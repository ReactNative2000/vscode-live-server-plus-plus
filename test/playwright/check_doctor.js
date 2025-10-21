const port = process.env.PORT || 3010;
const base = `http://127.0.0.1:${port}`;

(async ()=>{
  try{
    const res = await fetch(base + '/character/doctor');
    console.log('/character/doctor status', res.status);
    const j = await res.json().catch(()=>null);
    if(res.status !== 200) process.exit(2);
    if(!j || j.name !== 'The Doctor'){
      console.error('unexpected payload', j);
      process.exit(3);
    }
    console.log('doctor endpoint OK');
    process.exit(0);
  }catch(e){ console.error('check failed', e && e.message); process.exit(1); }
})();
