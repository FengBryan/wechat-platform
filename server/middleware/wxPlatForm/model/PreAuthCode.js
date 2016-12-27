var requset = require('node-weixin-request');
var async = require('async');
var platformSettings = require('../lib/wxPlatformSettings.js');
var ComAccessToken = require('./ComAccessToken.js');
var PreAuthCode = function () {
  this.code='';
}
PreAuthCode.prototype.get = function(cb)
{
  var comAccToken = new  ComAccessToken();
  async.waterfall([
    function(callback){
      platformSettings.getSettings(function(e,settings){
        if (e) return callback(e);
        return callback(null,settings.appid);
      });
    },
      function(appId,callback)
      {
        comAccToken.get(function(e,tokenIns){
          if (e) return callback(e);
          return callback(null,appId,tokenIns);
        });
      },
      function(appId,caToken,callback)
      {
        requset.json('https://api.weixin.qq.com/cgi-bin/component/api_create_preauthcode?component_access_token='+caToken,
          {component_appid:appId},
          function(e,res){
          if (e) return callback(e);
            if(res.pre_auth_code) return callback(null,res.pre_auth_code);
            else return callback(res);
        });
      }
    ],
    function(e,result)
    {
      if (e) return cb(e);
      else return cb(null,result);
    }
  )
}
module.exports=PreAuthCode;
