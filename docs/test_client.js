const http = require('http');
const querystring = require('querystring');

const payload = {
  fio: 'Иванов И.И.',
  topic: 'Тестовая тема',
  q1: 'Понял',
  q2: 'Залип на примере',
  q3: '5',
  q4: '😊',
  q5: ['Больше примеров', 'Интерактив']
};

function postJson(cb){
  const data = JSON.stringify(payload);
  const opts = { method: 'POST', port: 9000, path: '/exec', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } };
  const req = http.request(opts, res => {
    let r = '';
    res.on('data', c => r += c);
    res.on('end', () => cb(null, res.statusCode, r));
  });
  req.on('error', cb);
  req.end(data);
}

function postForm(cb){
  const data = querystring.stringify(payload, '&', '=', { encodeURIComponent: querystring.unescape });
  const opts = { method: 'POST', port: 9000, path: '/exec', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(data) } };
  const req = http.request(opts, res => {
    let r = '';
    res.on('data', c => r += c);
    res.on('end', () => cb(null, res.statusCode, r));
  });
  req.on('error', cb);
  req.end(data);
}

(async () => {
  await new Promise((r) => postJson((err, s, body) => { if(err) console.error(err); else console.log('JSON status', s, body); r(); }));
  await new Promise((r) => postForm((err, s, body) => { if(err) console.error(err); else console.log('Form status', s, body); r(); }));
})();
