'use strict';
var async = require('async');
var util = require('../../server/middleware/lib/util.js');
var config = require('../../server/config.json');
var path = require('path');
module.exports = function (User) {
  /*
   *   methods
   */
  User.register = function (userObj, cb) {
    async.waterfall([
      function (next) {
        if (_checkUser(userObj))  return next(util.makeRetMsg(0, 'user infomation is not available'));
        User.find({where: {email: userObj}}, function (e, users) {
          if (e) return next(e);
          if (users.length >= 1) return next(util.makeRetMsg(2, 'email have already exist'));
          return next();
        });
      },
      function (next) {
        User.find({where: {username: userObj.username}}, function (e, users) {
          if (e) return next(e);
          if (users.length >= 1) return next(util.makeRetMsg(2, 'username have already exist'));
          return next();
        });
      },
      function (next) {
        User.create(userObj, function (e, user) {
          console.log('create the user:' + user.username);
          if (e) return next(e);
          next(null, user);
        });
      }
    ], function (e, result) {
      if (e) return cb(e);
      cb(null, result);
    });
  };
  User.findByAppid = function (appid, cb) {
    User.find({where: {appid: appid}}, function (e, data) {
      if (e) return cb(e);
      if(data.length<1) return cb(new Error('no such user'));
      else return cb(null, data[0]);
    });
  }

  /*
   *   hooks
   */
  User.afterCreate = function (next) {
    var user = this;
    console.log('> user.afterRemote triggered');
    var options = {
      type: 'email',
      to: user.email.toString(),
      from: 'bryan.feng@inzen.com.cn',
      subject: 'Socialinzen welcoming mail.',
      template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      verifyHref: "http://socialinzen.inzen.com.cn/api/users/confirm?uid=" + this.id + '&redirect=http://socialinzen.inzen.com.cn',
      user: user
    };
    this.verify(options, function (err, response) {
      if (err) {
        User.deleteById(user.id);
        return next(err);
      }
      console.log('> verification email sent:', response);
      next();
    });
  };
  User.on('resetPasswordRequest', function (info) {
    var url = 'http://socialinzen.inzen.com.cn/api/user/resetpassword';
    var html = 'Click <a href="' + url + '?access_token=' +
      info.accessToken.id + '">here</a> to reset your password';

    User.app.models.Email.send({
      to: info.email,
      from: info.email,
      subject: 'Password reset',
      html: html
    }, function (err) {
      if (err) return console.log('> error sending password reset email');
      console.log('> sending password reset email to:', info.email);
    });
  });


  ////send password reset link when requested
  //User.on('resetPasswordRequest', function(info) {
  //  var url = 'http://' + config.host + ':' + config.port + '/reset-password';
  //  var html = 'Click <a href="' + url + '?access_token=' +
  //    info.accessToken.id + '">here</a> to reset your password';
  //
  //  User.app.models.Email.send({
  //    to: info.email,
  //    from: info.email,
  //    subject: 'Password reset',
  //    html: html
  //  }, function(err) {
  //    if (err) return console.log('> error sending password reset email');
  //    console.log('> sending password reset email to:', info.email);
  //  });
  //});
  function _checkUser(body) {
    var patten = /^[a-zA-Z]\w{3,15}$/ig;
    var email = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
    if (!body.username || !body.password) return true;
    if (body.username.length < 6) return true;
    if (body.password.length < 6) return true;
    if (!patten.test(body.username)) return true;
    if (!email.test(body.email)) return true;
    return false;
  }

};
