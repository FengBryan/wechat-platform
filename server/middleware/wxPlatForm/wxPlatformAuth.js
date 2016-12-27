var loopback = require('loopback');
var async = require('async');
var platformSettings = require('./lib/wxPlatformSettings.js');
var ComAccessToken = require('./model/ComAccessToken.js')
var PreAuthCode = require('./model/PreAuthCode.js');
var request = require('node-weixin-request');
var app = require('../../server.js');
var util = require('../lib/util');
module.exports = function (req, res) {
  var User = app.models.User;
  var uid = req.cookies['SocialinzenUser'];
  if (uid.length > 1) {
    User.findById(uid, function (e, user) {
      if (e) throw e;
      if (!user) return res.render('index');
      user.authTokens(function (err, ins) {
        if (err) throw err;
        if (ins) return res.redirect('/wxplatform/console');
        return auth(req.query.auth_code, user);
      });
    });
  }
  else {
    return res.render('index');
  }

  function auth(code, user) {
    if (!code) {
      async.waterfall([
        function (cb) {
          var preAuthCode = new PreAuthCode();
          preAuthCode.get(function (e, code) {
            if (e) return cb(e);
            return cb(null, code);
          });
        },
        function (code, cb) {
          platformSettings.getSettings(function (e, settings) {
            if (e) return cb(e);
            return cb(null, code, settings.appid);
          });
        },
        function (code, appid, cb) {
          var url = 'https://mp.weixin.qq.com/cgi-bin/componentloginpage?component_appid=' + appid +
            '&pre_auth_code=' + code +
            '&redirect_uri=http://socialinzen.inzen.com.cn' + req.path;
          cb(null, url);
        }
      ], function (e, result) {
        if (e) throw e;
        res.redirect(result);
        return;
      });
    }
    else {
      console.log('redirect successfull');
      async.waterfall([
          function (cb) {
            platformSettings.getSettings(function (e, settings) {
              if (e) return cb(e);
              return cb(null, settings.appid);
            });
          },
          function (appid, cb) {
            var comAccessToken = new ComAccessToken();
            comAccessToken.get(function (e, tokenIns) {
              if (e) return cb(e);
              return cb(null, appid, tokenIns);
            });
          },
          function (appid, token, cb) {
            var url = 'https://api.weixin.qq.com/cgi-bin/component/api_query_auth?component_access_token=' + token;
            var reqJson = {
              component_appid: appid,
              authorization_code: req.query.auth_code
            }
            request.json(url, reqJson, function (e, resp) {
              if (e) return cb(e);
              if (resp.errcode) return cb(resp);
              return cb(null, resp.authorization_info);
            });
          },
          function (authInfo, cb) {
            User.find({where: {appid: authInfo.authorizer_appid}}, function (e, users) {
              if (e) return cb(e);
              if (users.length > 0) return cb(util.makeRetMsg(1001, 'has been authorized by other user'));
              return cb(null, authInfo);
            });
          },
          function (authInfo, cb) {
            user.updateAttribute('appid', authInfo.authorizer_appid, function (e, ins) {
              if (e) return cb(e);
              return cb(null, authInfo);
            });
          },
          function (authInfo, cb) {
            var data =
              {
                appid: authInfo.authorizer_appid,
                token: authInfo.authorizer_access_token,
                expire: Date.parse(new Date()) / 1000 + 6900,
                refresh: authInfo.authorizer_refresh_token
              }
            user.authTokens.create(data, function (e, token) {
              if (e) return cb(e);
              return cb(null, token.token, user);
            });
          },
          function (token, user, cb) {
            var ticketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' +token+
              '&type=jsapi';
            request.get(ticketUri,function (e, resp, body) {
              if(e) return cb(e);
              body =JSON.parse(body);
              return cb(null,body.ticket,user);
            });
          },
          function (ticket, user, cb) {
            var initalTicket = {
              appid:user.appid,
              ticket:ticket,
              expire:Date.parse(new Date())/1000
            };
            user.jsTickets.create(initalTicket,function (e, ticketIns) {
              if(e) return cb(e);
              console.log('-------init js ticket--------');
              return cb();
            });
          }
        ],
        function (e, result) {
          if(e) return util.throw(e,res);
        });
    }
  }
}
