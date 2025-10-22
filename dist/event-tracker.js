// Lightweight delegated event tracker for UI events (payment clicks etc.)
// - Sends events to /track (server) as JSON
// - Persists a local copy in localStorage under 'lspp_events_v1'
// - Usage: add data-event="payment_click" and optional data-provider/data-label attributes

(function(){
  const LS_KEY = 'lspp_events_v1';

  function saveLocal(evt){
    try{
      const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      arr.push(evt);
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    }catch(e){ /* ignore */ }
  }

  function sendServer(evt){
    try{
      fetch('/track', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(evt) }).catch(()=>{});
    }catch(e){}
  }

  function buildEvent(el, type, extra){
    const now = Date.now();
    const ev = Object.assign({
      type: type || el.getAttribute('data-event') || 'ui_event',
      provider: el.getAttribute('data-provider') || el.getAttribute('data-src') || undefined,
      label: el.getAttribute('data-label') || (el.textContent||el.innerText||'').trim() || el.id || undefined,
      href: (el.href && el.href.indexOf(location.origin) === -1) ? el.href : undefined,
      path: location.pathname,
      ts: now,
      ua: navigator.userAgent
    }, extra || {});
    return ev;
  }

  // Delegated click handler
  document.addEventListener('click', function(e){
    try{
      let el = e.target;
      // walk up to find element with data-event attribute (limit 4 levels)
      for(let i=0;i<5 && el && el !== document.body;i++, el = el.parentElement){
        if(!el) break;
        const evName = el.getAttribute && el.getAttribute('data-event');
        if(evName){
          const provider = el.getAttribute('data-provider') || undefined;
          const extra = { clientX: e.clientX, clientY: e.clientY };
          const evt = buildEvent(el, evName, extra);
          saveLocal(evt);
          sendServer(evt);
          // allow default behavior (links open) but do not stop propagation
          break;
        }
      }
    }catch(err){ /* ignore */ }
  }, {passive:true});

  // expose a helper to flush local events manually
  window.__lspp_event_tracker = {
    flushLocal: function(){
      const arr = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      arr.forEach(ev => sendServer(ev));
      localStorage.removeItem(LS_KEY);
    },
    listLocal: function(){ return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); }
  };
})();
