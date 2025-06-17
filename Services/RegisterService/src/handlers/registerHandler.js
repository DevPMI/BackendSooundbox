const bcrypt = require('bcrypt');
const sequelize = require('../db');
const { Device } = require('../models');

module.exports = async function registerHandler(req, res) {
  let body = '';
  req.on('data', c => body += c);
  req.on('end', async () => {
    try {
      const { id, time_register } = JSON.parse(body);
      if (!id || !time_register) return fail(400,'Missing id/time_register',res);

      await sequelize.sync();
      if (await Device.findByPk(id)) return fail(409,'Device already registered',res);

      const passwordHash = await bcrypt.hash(time_register.toString(), 10);
      await Device.create({
        id,
        time_register: new Date(time_register * 1000),
        password: passwordHash,
        status: true
      });

      res.writeHead(201,{'Content-Type':'application/json'});
      res.end(JSON.stringify({
        status:'success', message:'Device registered',
        midware_timestamp:Math.floor(Date.now()/1000), response_code:'201'
      }));
    } catch(e){ console.error(e); fail(500,'Server error',res); }
  });
};

function fail(code,msg,res){
  res.writeHead(code,{'Content-Type':'application/json'});
  res.end(JSON.stringify({
    status:'fail', message:msg,
    midware_timestamp:Math.floor(Date.now()/1000), response_code:String(code)
  }));
}
