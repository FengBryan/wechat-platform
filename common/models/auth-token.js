'use strict';
var async = require('async');
var request = require('node-weixin-request');
var util = require('../../server/middleware/lib/util.js');
var ComAccessToken = require('../../server/middleware/wxPlatForm/model/ComAccessToken.js');
var platformSettings = require('../../server/middleware/wxPlatForm/lib/wxPlatformSettings.js');
module.exports = function(Authtoken) {
  Authtoken.getToken = function (appid,cb)
  {
    async.waterfall([
      function(next)
      {
        Authtoken.app.models.User.findByAppid(appid,function (e, user) {
          if(e) return next(e);
          return next(null,user);
        });
      },
      function (user, next) {
        user.authTokens(function (e, ins) {
          if(e) return next(e);
          return next(null,ins);
        });
      },
      function(ins,next)
      {
        if(ins===null) return next(util.makeRetMsg(1000,'need authorize info,redirect to auth please'));
        if(ins.expire<=Date.parse(new Date())/1000) return next(null,ins);
        else return next('final',ins);
      },
      function(ins,next)
      {
        platformSettings.getSettings(function(e,data){
          if(e) return next(e);
          else return next(null,data.appid,ins);
        });
      },
      function(comid,ins,next)
      {
        var comAccessToken = new ComAccessToken();
        comAccessToken.get(function(e,token){
          if(e) return next(e);
          console.log(token);
          return next(null,comid,ins,token);
        });
      },
      function(comid,ins,token,next)
      {
        var url='https://api.weixin.qq.com/cgi-bin/component/api_authorizer_token?component_access_token='+token;
        var json ={
          component_appid:comid,
          authorizer_appid:appid,
          authorizer_refresh_token:ins.refresh
        }
        console.log('---request new auth token---');
        request.json(url,json,function(e,body){
          if(e) return next(e);
          else return next(null,body,ins);
        });
      },
      function(resp,ins,next)
      {
        if(resp.errcode) return next(resp);
        var Attributes ={
          token:resp.authorizer_access_token,
          expire:Date.parse(new Date())/1000+6900,
          refresh:resp.authorizer_refresh_token
        }
        console.log(Attributes);
        ins.updateAttributes(Attributes,function(e,updateIns){
          if(e) return next(e);
          else return next(null,updateIns);
        });
      }
    ],
    function(err,result){
      if(err==='final') return cb(null,result);
      if(err) return cb(err);
      else cb(null,result);
    });
  }
};
