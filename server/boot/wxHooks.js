var config = require('../config.json');
var path = require('path');
var async = require('async');
var util =require('../middleware/lib/util.js');
var wxHooks = require('../middleware/wxPlatForm/eventResiger.js')
module.exports = function(server)
{
  server.on('wx-subscribe',wxHooks.subscribeHook);
  server.on('wx-unsubscribe',wxHooks.unsubscribeHook);
  server.on('wx-msg-text',wxHooks.msgReplyText);
  server.on('wx-msg-image',wxHooks.msgReplyImage);
  server.on('wx-msg-voice',wxHooks.msgReplyVoice);
  server.on('wx-msg-location',wxHooks.msgReplyLocation);
  console.log('----------wx hooks setup----------');
}
