var loopback = require('loopback');
var wxPlatformSettings = {};

wxPlatformSettings.getSettings = function (cb) {
  var settings = loopback.findModel('wxplatform');
  settings.find({where: {name: 'settings', id: 'settings'}}, function (e, data) {
    if (e) return cb(e);
    if (data.length < 1) return cb(new Error('no data in platform settings'));
    var verifyticket = loopback.findModel('verify_ticket');
    verifyticket.find({where: {name: "verify_ticket", id: "verify_ticket"}}, function (err, ticket) {
      if (err) return cb(err);
      if (ticket.length < 1) return cb(new Error('no data in platform settings'));
      var json = {
        appid: data[0].appid,
        appsecret: data[0].appsecret,
        encodingAESKey: data[0].encodingAESKey,
        token: data[0].token,
        verify_ticket: ticket[0].verify_ticket
      }
      cb(null, json);
    });
  });
}
module.exports = wxPlatformSettings;
