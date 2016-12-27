var app = require('../../server.js');
var async = require('async');
var ReplyFormat = require('./lib/replyFormat.js');
var checkToken = require('../admin/user/userAccess.js');
var util = require('../lib/util.js');
module.exports = function (req, res) {
  var User = app.models.User;
  var token = req.accessToken;
  checkToken(token,function (e, user) {
    if (e) return util.throw(e,res);
      router(req, res, user);
  });
}
function router(req, res, user) {
  console.log('Msg Router SetUp!');
  switch (req.params.action) {
    case 'addReply':
      addReply(req, res, user);
      break;
    case 'listTypes':
      listTypes(req,res,user);
      break;
    case 'deleteReply':
      deleteReply(req,res,user);
      break;
    case 'listReplys':
      listReplys(req,res,user);
      break;
  }
}
function addReply(req, res, user) {
  //return console.log(req.body);

  var format = req.body.type;
  var reply = req.body.reply;//eval('('+req.body.reply+')');
  var request = req.body.request;
  if (!format || !reply ||!request) {
    return res.send(util.makeRetMsg(0, 'args is not avaliable'));
  }
  var saveReply = ReplyFormat(format);
  saveReply.set(reply);
  var replyObj = {
    request:req.body.request,
    reply:saveReply.get(),
    appid:user.appid
  }
  async.waterfall([
    function (next) {

      user.rules.findOne({_id:request},function (e, rules) {
        if(e) return next(e);
        if(rules) return next(util.makeRetMsg(2,'request has been existed'));
        else return next(null,user);
      });
    },
    function (action,next) {
      user.rules.create(replyObj,function (e, ins) {
        if(e) return next(e);
        return next(null,util.makeRetMsg(200,'Reply add successfully'));
      });
    }
  ],
  function (e, status) {
    if(e) return util.throw(e,res);
    return res.send(status).end();
  })
}

function listTypes(req, res, user) {
  res.send(ReplyFormat('types').get());
}
function deleteReply(req,res,user) {
  var request = req.body.request;
  user.rules.destroyById(request,function (e) {
    if(e) throw e;
    else return res.send(util.makeRetMsg(200, 'delete rules successfunlly'));
  });
}
function listReplys(req,res,user) {
  user.rules.find(user.appid,function (e,data) {
    if(e) throw e;
    if(data.length<1) return res.send(util.makeRetMsg(1, 'rules has not existed'));
    return res.send(util.makeRetMsg(200, 'list rules successfunlly'));
  });
}

