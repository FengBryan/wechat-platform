module.exports = util = {};

util.makeRetMsg = function (status, msg) {
  var back = {};
  back.errcode = status;
  back.msg = msg;
  return back;
}
util.throw = function (e,res) {
  if (e.errcode||e.errcode===0) return res.send(e).end();
  else {
    if(e.name=='WeChatAPIConnectionTimeoutError') {console.log(e); return res.send(this.makeRetMsg(1004,'request wechat service timeout,please try again'));}
    else throw e;
  }
}
