var loopback = require('loopback');
var CacheTokenHandler = require('../lib/cacheTokenHandler.js');
var async = require('async');
var platformSettings = require('../lib/wxPlatformSettings.js');
var ComAccessToken = function()
{
  this.data={};
  this.data.id='token';
  this.data.token='';
  this.data.expire='';
}
ComAccessToken.prototype.get = function(cb)
{
  var that = this;
  var cacheTokenHandler = new CacheTokenHandler(loopback.findModel('ComAccessToken'));
  async.waterfall([
    function(next)
    {
      cacheTokenHandler.checkExpire(function(e,status){
        if (e) return next(e);
        next(null,status);
      });
    },
    function(status,next)
    {
      if (!status)
      {
        cacheTokenHandler.getTokenInDb(function(e,data){
          var finalObj={
            errcode:'200',
            msg:'success cache token use'
          };
          return next(finalObj,data);
        });
      }
      else
      {
        platformSettings.getSettings(function(e,data){
          if (e) return next(e);
          var json ={
            component_appid : data.appid,
            component_appsecret : data.appsecret,
            component_verify_ticket : data.verify_ticket
          }
          cacheTokenHandler.request('https://api.weixin.qq.com/cgi-bin/component/api_component_token',json,function(err,body){
            if (err) return next(err);
            next(null,body);
          });
        });
      }
    },
    function(resp,next)
    {
      if (resp.errcode) return next(resp);
      that.data.token=resp.component_access_token;
      that.data.expire = Date.parse(new Date())/1000+6900;
      cacheTokenHandler.saveToken(that.data,function(e,m){
        if (e) return next(e);
        return next(null,m);
      });
    }
  ],function(err,result){
    if (err)
    {
      if (err.errcode)
      {
        if (err.errcode=='200') return cb(null,result.token);
        else
          return cb(err);
      }
      else
        throw err;
    }
    else
    {
      return cb(null,result.token);
    }
  });
}
module.exports = ComAccessToken;
