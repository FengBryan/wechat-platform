var platPlatformSettings =require('./lib/wxPlatformSettings');
var ComAccessToken = require('./model/ComAccessToken');
var app = require('../../server.js');
var async = require('async');
var request = require('node-weixin-request')
module.exports = function (req,res) {
  var appid = req.query.appid;
  var state = req.query.state;
  var code = req.query.code;
  var scope = req.query.scope;
  if (!appid&&!state) return res.status(404).end('page need appid param');
  if (!code)
  {
    getCodeForOpenId(appid,scope,function (e,uri) {
      if(e) throw e;
      return res.redirect(uri);
    });
  }
  else
  {
    getAccessTokenForOpenId(state,code,function (e, accesstoken,openid) {
      if(e) throw e;
      console.log(accesstoken);
      return res.send(accesstoken+'／n'+openid).end();
    });
  }
}
function getCodeForOpenId(appid,scope,cb)
{
  async.waterfall([
    function (next) {
      platPlatformSettings.getSettings(function (e, settings) {
        if(e) return next(e);
        return next(null,settings.appid);
      });
    },
    function (comid, next) {
      var redirectUri ='https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +appid +
        '&redirect_uri=http://socialinzen.inzen.com.cn/wxplatform/webauth' +
        '&response_type=code&scope=' +scope+
        '&state=' +appid +
        '&component_appid=' + comid +
        '#wechat_redirect';
      return next(null,redirectUri);
    }
  ],function (e,redirect) {
    if (e) cb(e);
    return cb(null,redirect);
  });
}
function getAccessTokenForOpenId(appid,code,cb) {
  async.waterfall([
    function (next) {
      platPlatformSettings.getSettings(function (e, settings) {
        if(e) return next(e);
        return next(null,settings.appid);
      });
    },
    function (comid,next) {
      var comAccessToken = new ComAccessToken();
      comAccessToken.get(function (e, token) {
        if (e) return next(e);
        return next(null,comid,token);
      });
    },
    function (comid,token,next) {
      var redirect = 'https://api.weixin.qq.com/sns/oauth2/component/access_token?appid=' +appid+
        '&code=' + code+
        '&grant_type=authorization_code&component_appid=' +comid +
        '&component_access_token='+token;
      request.get(redirect,function (e, resp, body) {
        if(e) next(e);
        var token = JSON.parse(body);

        return next(null,token.access_token,token.openid);
      });
    }
  ],function (e, accessToken,openId) {
    if(e) return cb(e);
    return cb(null,accessToken,openId);
  });

}
