
(async ()=>{
  try{
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3010';
    const adminToken = process.env.ADMIN_TOKEN || 'testtoken';
    // call pay-from man
    let resp = await fetch(base + '/admin/pay-from/man', { method: 'POST', headers: { 'Authorization': 'Bearer ' + adminToken }, body: new URLSearchParams({ amount: '777' }) });
    console.log('/admin/pay-from/man', 'status', resp.status);
    if(resp.status !== 200) process.exit(2);
    const j = await resp.json();
    console.log('created', j.stripe_id);
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
