const http = require('http');
const loginHandler = require('./handlers/loginHandler'); 

require('dotenv').config();

const PORT = process.env.PORT || 3003;   
http.createServer((req,res)=>{
  if (req.method==='POST' && req.url==='/login') return loginHandler(req,res);

  res.writeHead(404,{'Content-Type':'application/json'});
  res.end(JSON.stringify({message:'Endpoint not found'}));
}).listen(PORT, ()=>console.log(`Login‑service on http://localhost:${PORT}`));
