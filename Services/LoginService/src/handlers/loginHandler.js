const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../db');
const { Device } = require('../models');
const { logRequest, logResponse, logError } = require('../utils/logger');

const SECRET_KEY = process.env.SECRET_KEY || 'rahasia';

module.exports = async function loginHandler(req,res){
  let body=''; req.on('data',c=>body+=c);
  req.on('end', async ()=>{
    logRequest(req, body); //log request
    try{
      const { id, password } = JSON.parse(body);
      if(!id||!password) return fail(400,'Missing id/password',res);

      const device = await Device.findByPk(id);
      if(!device) return fail(404,'Device not found',res);

      const ok = await bcrypt.compare(password.toString(), device.password);
      if(!ok) return fail(401,'Invalid credentials',res);

      const token = jwt.sign({ id:device.id }, SECRET_KEY,{ expiresIn:'1h'});

       logResponse(200, `Login successful for id=${id}`); // log  response

      res.writeHead(200,{'Content-Type':'application/json'});
      res.end(JSON.stringify({
        status:'success', message:'Login successful', token,
        midware_timestamp:Math.floor(Date.now()/1000), response_code:'200'
      }));
    }catch(e){ 
      logError(e); // log error
      console.error(e);
       fail(500,'Server error',res);}
  });
};

function fail(code,msg,res){
  logResponse(code, msg); // log response fail
  res.writeHead(code,{'Content-Type':'application/json'});
  res.end(JSON.stringify({
    status:'fail', message:msg,
    midware_timestamp:Math.floor(Date.now()/1000), response_code:String(code)
  }));
}
