'use strict';
var async =require('async');
var request = require('node-weixin-request')
module.exports = function(Jsticket) {
  Jsticket.getTicket = function (appid, cb) {
    var User = Jsticket.app.models.User;
    async.waterfall([
      function (next) {
        User.findByAppid(appid, function (e, user) {
          if (e) return next(e);
          else return next(null, user);
        });
      },
      function (user, next) {
        user.jsTickets(function (e, ticket) {
          if (e) return next(e);
          if (!ticket) return next(new Error('please init js ticket first'));
          return next(null, ticket, user);
        });
      },
      function (ins, user, next) {
        if (ins.expire>Date.parse(new Date())/1000) return next('cached ticket', ins.ticket);
        else {
          user.authTokens(function (e, authtoken) {
            if (e) return next(e);
            return next(null, authtoken, user);
          });
        }
      },
      function (authToken,user, next) {
        var ticketUri = 'https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=' + authToken +
          '&type=jsapi';
        request.get(ticketUri, function (e, resp, body) {
          if (e) return next(e);
          body = JSON.parse(body);
          return next(null, body.ticket, user);
        });
      },
      function (ticket, user, next) {
        var upObj = {
          appid: appid,
          ticket: ticket,
          expire: Date.parse(new Date()) / 1000
        }
        user.jsTickets.update(upObj, function (e, ticketIns) {
          if (e) return next(e);
          return next(null, ticket);
        });
      }
    ], function (e, ticket) {
      if (e === 'cached ticket') return cb(null, ticket);
      if (e) return cb(e);
      return cb(null, ticket);
    });
  }
}
