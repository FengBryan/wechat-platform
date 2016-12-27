var app = require('../../../server.js');
var util = require('../../lib/util.js');
var async = require('async');
module.exports = function (req, res) {
  var action = req.params.action;
  switch (action) {
    case 'login':
      login(req, res);
      break;
    case 'logout':
      logout(req, res);
      break;
    case 'register' :
      register(req, res);
      break;
    case 'resetpassword' :
      resetPassword(req, res);
      break;
    default :
      res.status(404).end('page not found');
  }
}
var login = function (req, res) {
  var user = app.models.User;
  if (checkUsername(req.body)) {
    res.send(util.makeRetMsg(0, 'args is not available')).end();
    return;
  }
  user.login({username: req.body.username, password: req.body.password}, "user", function (e, token) {
    if (e)  throw e;//res.send(util.makeRetMsg(100,'login fail'));
    token = token.toJSON();
    console.log(token);
    res.cookie('SocialinzenToken', token.id, {maxAge: 60 * 60 * 24 * 3 * 1000})
      .cookie('SocialinzenUser', token.user.id, {maxAge: 60 * 60 * 24 * 3 * 1000})
      .redirect('/wxplatform/auth');
  });
}
var logout = function (req, res) {
  if (req.cookies['SocialinzenToken']) {//change to query token when complete with front
    var user = app.models.User;
    user.logout(req.cookies['SocialinzenToken'], function (e) {
      if (e) throw e;
      res.clearCookie('SocialinzenToken').clearCookie('SocialinzenUser').send(util.makeRetMsg(200, 'logout success')).end();
    });
  }
}
var register = function (req, res) {
  var user = app.models.User;
  user.register(req.body, function (e, user) {
    if (e) throw e;
    res.send(util.makeRetMsg(200, 'register:' + user.username + ' successfully')).end();
  });
}
var resetPassword = function (req, res) {
  var user = app.models.User;
  async.waterfall([])
}
function checkUsername(body) {
  var patten = /^[a-zA-Z]\w{3,15}$/ig;
  if (!body.username || !body.password) return true;
  if (body.username.length < 6) return true;
  if (body.password.length < 6) return true;
  if (!patten.test(body.username)) return true;
  return false;
}
