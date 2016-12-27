var loopback = require('loopback');
var async = require('async');
var request = require('node-weixin-request');
var Handler = function (modelObj) {
  if (!modelObj) {
    return 'can not to create a hanlder without args';
  }
  this.model = modelObj;
}
Handler.prototype.saveToken = function (obj, cb) {
  var modelInstance = this.model;
  modelInstance.upsert(obj, function (e, ins) {
    if (e) return cb(e);
    return cb(null, ins);
  });
}
Handler.prototype.checkExpire = function (cb) {
  var modelInstance = this.model;
  modelInstance.findById('token', function (e, ins) {
    if (e) return cb(e);
    if (!ins) return cb(null, true);
    if (ins.expire <= Date.parse(new Date()) / 1000) return cb(null, true);
    return cb(null, false);
  });
}
Handler.prototype.getTokenInDb = function (cb) {
  var modelInstance = this.model;
  modelInstance.findById('token', function (e, ins) {
    if (e) return cb(e);
    if (!ins) return cb(new Error('no data'));
    return cb(null, ins);
  });
}
Handler.prototype.request = function (url, json, cb) {
  request.json(url, json, function (e, body) {
    if (e) return cb(e)
    return cb(null, body);
  });
}
module.exports = Handler;

