(async ()=>{
  try{
    const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:3010';
    const adminToken = process.env.ADMIN_TOKEN || 'testtoken';
    // schedule a gift
    let resp = await fetch(base + '/admin/schedule-gift', { method: 'POST', headers: { 'Authorization': 'Bearer ' + adminToken, 'Content-Type':'application/json' }, body: JSON.stringify({ who: 'god', amount: 500, run_at: Date.now() + 2000 }) });
    console.log('/admin/schedule-gift', resp.status);
    if(resp.status !== 200) process.exit(2);
    const j = await resp.json();
    console.log('scheduled id', j.id);
    // wait 4 seconds for scheduler
    await new Promise(r => setTimeout(r, 4000));
    // fetch ledger CSV
    resp = await fetch(base + '/admin/ledger.csv', { headers: { 'Authorization': 'Bearer ' + adminToken } });
    console.log('/admin/ledger.csv', resp.status);
    if(resp.status !== 200) process.exit(3);
    const txt = await resp.text();
    console.log('ledger head:\n', txt.split('\n').slice(0,5).join('\n'));
    // refund the most recent payment (find id from CSV)
    const lines = txt.trim().split('\n');
    if(lines.length < 2) { console.error('no payments'); process.exit(4); }
    const cols = lines[1].split(',');
    const id = cols[0];
    resp = await fetch(base + '/admin/refund/' + id, { method: 'POST', headers: { 'Authorization': 'Bearer ' + adminToken } });
    console.log('/admin/refund/' + id, resp.status);
    if(resp.status !== 200) process.exit(5);
    console.log('OK');
    process.exit(0);
  }catch(e){ console.error(e); process.exit(1); }
})();
