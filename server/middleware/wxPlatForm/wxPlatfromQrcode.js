var util = require('../lib/util.js');
module.exports = function (req, res, api) {
  if (req.body.expire) return createTmpQrCode(req,res,api);
  else return createLimitQrCode(req,res,api);
}
function createTmpQrCode(req,res,api) {
  var senseId = req.body.senseId;
  if(!(/^\d+$/.test(senseId)||senseId.length>=32)) return res.send(util.makeRetMsg(0,'invalid senseId arg' )).end();
  var expire = req.body.expire;
  if(expire>604800 || expire<1 || !/^\d+$/.test(expire)) return res.send(util.makeRetMsg(0,'invalid expire arg')).end();
  api.createTmpQRCode(senseId,expire,function (e, ticket) {
    if(e) return util.throw(e);
    if (ticket) return res.send({qrcodeUrl:api.showQRCodeURL(ticket.ticket)});
  })
}
function createLimitQrCode(req,res,api) {
  var senseId = req.body.senseId;
  if (/^\d+$/.test(senseId))
  {
    if(senseId>10000) return res.send(util.makeRetMsg(0,'invalid senseId arg'));
  }
  else
  {
    if(senseId.length>64) return res.send(util.makeRetMsg(0,'invalid senseId arg'));
  }
  api.createLimitQRCode(senseId,function (e,ticket) {
    if(e) return util.throw(e);
    if(ticket) return res.send({qrcodeUrl:api.showQRCodeURL(ticket.ticket)});
  });
}
