var async = require('async');
var request = require('node-weixin-request');
/*
event trigger 'wx-subscribe'
 */
var subscribeHook = function (msg, res, utils) {
  var user = utils.user;
  var api = utils.api;
  var openid = msg.FromUserName;
  //console.log(api );
  async.waterfall([
    function (next) {
      var url = 'https://api.weixin.qq.com/cgi-bin/user/info?access_token=' + api.token.accessToken +
        '&openid=' + openid +
        '&lang=zh_CN ';
      request.get(url,function (e, resp, body) {
        if(e) return next(e);
        if(body.errcode) return next(body);
        return next(null,JSON.parse(body));
      })
    },
    function (userinfo, next) {
      userinfo.appid = user.appid;
      user.wxFollowers.create(userinfo,function (e, ins) {
        if(e) return next(e);
        return next(null,ins);
      });
    }
  ],function (e, i) {
    if(e) return util.throw(e,res);
    return res.reply(i.nickname+'欢迎关注');
  });
}
/*
 event trigger 'wx-unsubscribe'
 */
var unsubscribeHook = function (msg, res, user) {
  var openid = msg.FromUserName;
  user.wxFollowers.destroy(openid,function (e) {
    if(e) throw e;
    console.log('-----follower:'+openid+'unsubscribe');
    res.send('success').end();
  });
}
/*
 event trigger 'wx-msg-text'
 */
var msgReplyText = function (msg, res, utils) {
  var api = utils.api;
  var user = utils.user;
  user.rules({where:{_id:{inq:[msg.Content,'default']}}},function (e,rule) {
    if(e) return util.throw(e,res);
    if(!rule || rule.length==0) return res.reply('该回复尚未收录,试试别的吧～')
    if(rule.length==1 ) {console.log(rule[0].reply); return res.reply(rule[0].reply);}
    rule.forEach(function (value, index) {
      if (value.request == msg.Content)
      {}return res.reply(value.reply);
    });
  });
}
/*
 event trigger 'wx-msg-image'
 */
var msgReplyImage = function (msg, res, user) {

}
/*
 event trigger 'wx-msg-voice'
 */
var msgReplyVoice = function (msg, res, utils) {

}
/*
 event trigger 'wx-msg-location'
 */
var msgReplyLocation = function (msg, res, utils) {

}
var wxHooks ={};
wxHooks.subscribeHook = subscribeHook;
wxHooks.unsubscribeHook = unsubscribeHook;
wxHooks.msgReplyText = msgReplyText;
wxHooks.msgReplyImage = msgReplyImage;
wxHooks.msgReplyVoice = msgReplyVoice;
wxHooks.msgReplyLocation = msgReplyLocation;
module.exports = wxHooks;
