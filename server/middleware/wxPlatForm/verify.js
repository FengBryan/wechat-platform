var verify = {};
var loopback = require("loopback");
var WXBizMsgCrypt = require('../lib/wxcrypto.js');
var DOMParser = require('xmldom').DOMParser;
var util = require('../lib/util');
var log = require('../lib/log.js');
var MODULENAME = 'WxPlatformVerifyTicket';

verify.checkTicket = function (req, res) {
  //console.log(req.body);
  //res.end();
  //return;eq
  if (!req.body.xml) {
    return
  }
  //console.log(req.body.xml);

  var wxplatform = loopback.findModel('wxplatform');

  wxplatform.find({where: {name: "settings", id: "settings"}}, function (err, data) {
    if (err) {
      log.error('fail', 'while getting wxplatform settings', MODULENAME);
      return;
    }
    var wxbizmsgcrypt = new WXBizMsgCrypt(data[0].token, data[0].encodingAESKey, data[0].appid);
    var decodemsg = wxbizmsgcrypt.decrypt(req.body.xml.encrypt.toString());
    var doc = new DOMParser().parseFromString(decodemsg.message);
    var retdata = {};
    //console.log(doc.getElementsByTagName('InfoType')[0].childNodes[0].nodeValue);
    //return;
    switch (doc.getElementsByTagName('InfoType')[0].childNodes[0].nodeValue) {
      case "component_verify_ticket": {
        retdata.verify_ticket = doc.getElementsByTagName('ComponentVerifyTicket')[0].childNodes[0].nodeValue;
        retdata.name = 'verify_ticket';
        retdata.id = 'verify_ticket';
        var verifyticket = loopback.findModel('verify_ticket');
        verifyticket.upsert(retdata, function (err, m) {
          if (err) {
            log.error('fail', 'save verify ticket', MODULENAME);
            return;
          }
          log.normal('success', 'save verify ticket', MODULENAME);
          res.send('success');
          return;
        });
        break;
      }
      case "unauthorized": {
        log.normal('openplatform push message: unauthorized by' + doc.getElementsByTagName('AuthorizerAppid')[0].childNodes[0].nodeValue, MODULENAME);
        res.send('success');
        break;
      }
      case "authorized" : {
        log.normal('openplatform push message: authorized by' + doc.getElementsByTagName('AuthorizerAppid')[0].childNodes[0].nodeValue, MODULENAME);
        res.send('success');
        break;
      }
      case "updateauthorized": {
        log.normal('openplatform push message: updateauthorized by' + doc.getElementsByTagName('AuthorizerAppid')[0].childNodes[0].nodeValue, MODULENAME);
        res.send('success');
        break;
      }
    }

  });

}


module.exports = verify;
