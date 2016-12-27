var loopback = require('loopback');
var CacheTokenHandler = require('../lib/cacheTokenHandler.js');
var async = require('async');
var platformSettings = require('../lib/wxPlatformSettings.js');
var AuthorizerAccessToken = function () {
  this.data.token='';
  this.data.id ='token';
  this.data.expire='';
  this.data.refreshtoken='';
}
AuthorizerAccessToken.prototype.get = function(user,cb)
{

  var cacheTokenHandler = new CacheTokenHandler(loopback.findModel('AuthToken'))
}
