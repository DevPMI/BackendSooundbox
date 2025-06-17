const http = require('http');
const registerHandler = require('./handlers/registerHandler');
require('dotenv').config();

const PORT = process.env.PORT || 3002;   // contoh: 3002
http.createServer((req,res)=>{
  if (req.method==='POST' && req.url==='/register') return registerHandler(req,res);

  res.writeHead(404,{'Content-Type':'application/json'});
  res.end(JSON.
    stringify
    (
        {message:'Endpoint not found'}
    )
);
}).listen(PORT, ()=>console.log(`Register‑service on http://localhost:${PORT}`));
