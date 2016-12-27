var app = require('../../server.js');
var MODULENAME = 'WxplatformMsgRouter';
var util= require('../lib/util.js');
var openApi = require('./lib/openApi.js');
var async = require('async');
var Event =require('events');
module.exports = function (req, res, next) {
  if (req.params.appid.length < 18) return res.status(404).end();
  var type = req.weixin.MsgType;
  var User = app.models.User;
  User.findByAppid(req.params.appid,function (e, user) {
    if(e) return util.throw(e,res);
    openApi(user.appid,function (e, api) {
      if(e) return util.throw(e,res);
      if(type=='event'&&req.weixin.Event=='subscribe')return app.emit('wx-subscribe',req.weixin,res,{api:api,user:user});
      if(type=='event'&&req.weixin.Event=='unsubscribe') return app.emit('wx-unsubscribe',req.weixin,res,user);
      switch (type)
      {
        case'text':app.emit('wx-msg-text',req.weixin,res,{api:api,user:user});break;
        case'image':app.emit('wx-msg-image',req.weixin,res,user);break;
        case'location':app.emit('wx-msg-location',req.weixin,res,{api:api,user:user});break;
        case'voice':app.emit('wx-msg-voice',req.weixin,res,{api:api,user:user});
      }
    });
  });
  return;
  async.waterfall([
      function (next) {
        User.findByAppid(req.params.appid, function (e, ins) {
          if (e) return next(e);
          return next(null, ins);
        });
      },
      function (user, next) {
        console.log(req.weixin);
        user.rules.findById(req.weixin.Content, function (e, reply) {
          if (e) return next(null, {type: 'text', content: '该回复尚未收录，试试别的吧'});
          else return next(null, reply.reply);
        });
      }
    ],
    function (e, result) {
      if (e) throw e;
      return res.reply(result.content);
    });
  //var message = req.weixin;
  //message.toAppid=req.params.appid;
  //console.log(message);
  //var rules =loopback.findModel('rules');
  //rules.find({where:{id:message.toAppid,request:message.Content}},function(err,data)
  //{
  //   if (err)
  //   {
  //     log.error('fail','error happened during find rules',MODULENAME);
  //     throw err;
  //   }
  //   if (data.length==0)
  //   {
  //     res.reply({type:'text',content:'该回复尚未收录，试试别的吧'});
  //     res.end();
  //     return;
  //   }
  //  res.reply(data[0].reply);
  //  return;
  //});

}


