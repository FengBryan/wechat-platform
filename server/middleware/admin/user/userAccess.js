var app = require('../../../server.js');
var util = require('../../lib/util.js');
module.exports = function (token, cb) {
  var User = app.models.User;
  if(!token) return cb(util.makeRetMsg(0,'invalid access token,login in first'));
  token.validate(function (e, is) {
    if(e) return cb(e);
    if(!is) return cb(util.makeRetMsg(0,'access token is invalid'));
    User.findById(token.userId, function (err, user) {
      if (err) return cb(err);
      return cb(null,user);
    });
  });
}
