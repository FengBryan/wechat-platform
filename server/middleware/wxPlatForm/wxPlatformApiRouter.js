var app = require('../../server');
var util =require('../lib/util');
var async = require('async');
var crypto = require('crypto');
var openApi = require('./lib/openApi.js');
var getQrcode = require('./wxPlatfromQrcode.js');
var followers = require('./wxPlatformFollowers.js');
var checkToken = require('../admin/user/userAccess.js');
module.exports = function (req, res) {
  if (!req.body.appid && !req.accessToken) return res.send(util.makeRetMsg(0,'no avaliable appid'));
  if (req.params.action =='jsticket') return getJsTicket(req, res);
  checkToken(req.accessToken,function (e, user) {
    if(e) return util.throw(e,res);
    openApi(user.appid,function (e, api) {
      if(e) return util.throw(e,res);
      switch (req.params.action) {
        case 'qrcode':
          getQrcode(req,res,api);
          break;
        case 'updateRemark':
          followers.updateRemark(req,res,api);
          break;
        case 'getGroups':
          followers.getGroups(req,res,api);
          break;
        case 'getWhichGroup':
          followers.getWhichGroup(req,res,api);
          break;
        case 'createGroup':
          followers.createGroup(req,res,api);
          break;
        case 'updateGroup':
          followers.updateGroup(req,res,api);
          break;
        case 'moveUserToGroup':
          followers.moveUserToGroup(req,res,api);
          break;
        case 'removeGroup':
          followers.removeGroup(req,res,api);
          break;
        case 'getFollowersByGroup':
          followers.getFollowersByGroup(req,res,api,user);
          break;
      }
    });
  });

}
function getJsTicket(req,res)
{
  var appid = req.body.appid;
  var url = req.body.url;
  if(!appid || !url)
  {
    return res.send(util.makeRetMsg(0,'no required args'));
  }
  var User = app.models.User;
  async.waterfall([
    function (next) {
      User.findByAppid(appid,function (e, user) {
        if(e) return next(e);
        return next(null,user);
      });
    },
    function (user, next) {
      user.jsTickets(function (e, ticketIns) {
        if(e) return next(e);
        if(!ticketIns) return next(util.makeRetMsg(0,'no authorization'));
        return next();
      })
    },
    function (next) {
      app.models.JsTicket.getTicket(appid,function (e, ticket) {
        if(e) return next(e);
        return next(null,ticket);
      });
    },
    function (ticket, next) {
      var sha1 = crypto.createHash('sha1');
      var sign={
        appid:appid,
        nonceStr:"noStrAASOc1#@@=",
        timestamp:Date.parse(new Date())/1000,
        jsapi_ticket:ticket
      }
      var signature ='jsapi_ticket='+sign.jsapi_ticket+'&noncestr='+sign.nonceStr+'&timestamp='+sign.timestamp+'&url='+url;
      sha1.update(signature);
      sign.signature=sha1.digest('hex');
      return next(null,sign);
    }
  ],function (e,sign) {
    if(e) throw e;
    return res.send(sign).end();
  });
}
