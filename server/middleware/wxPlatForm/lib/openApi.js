var async = require('async');
var Api = require('open-wechat-api');
var app = require('../../../server.js');
module.exports = function (appid,cb) {
  var AuthToken = app.models.AuthToken;
  AuthToken.getToken(appid,function (e, token) {
    if(e) return cb(e);
    if(!token) return cb(new Error('no such fucking token!'));
    else
    {
      var api = new Api(appid,{authorizer_access_token:token.token,expires_at:token.expire*1000});
      api.setOpts({timeout: 200000});
      return cb(null,api);
    }
  })
  // async.waterfall([
  //   function (next) {
  //     var User = app.models.User;
  //     User.findByAppid(appid,function (e,user) {
  //       if(e) return next(e);
  //       return next(null,user);
  //     });
  //   },
  //   function (user, next) {
  //   var AuthToken = app.models.AuthToken;
  //     console.log(user.rules);
  //     return;
  //     user.authTokens.getToken(user.appid,function (e, token) {
  //       if(e) return next(e);
  //       var api = new Api(user.appid,{authorizer_access_token:token.token,expires_at:token.expire*1000});
  //       return next(null,api);
  //     });
  //   }
  // ],function (e, api) {
  //   if(e) return cb(e);
  //   return cb(null,api);
  // })
}
