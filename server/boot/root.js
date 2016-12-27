var userRouter = require('../middleware/admin/user/userAction.js');
// var fileRouter = require('../middleware/admin/file/fileUpload.js');
var wxApiRouter = require('../middleware/wxPlatForm/wxPlatformApiRouter.js');
var wxReplyRouter = require('../middleware/wxPlatForm/wxPlatformMsgReply.js');
var multipart = require('connect-multiparty');
module.exports = function (server) {
  // Install a `/` route that returns server status
  var multipartMiddleware = multipart();
  var router = server.loopback.Router();
  router.get('/', function (req, res) {
    var AccessToken = server.models.AccessToken;
    if (req.cookies['SocialinzenToken']) {
      var accessToken = new AccessToken({id: req.cookies['SocialinzenToken']});
      accessToken.validate(function (e, isValid) {
        if (e) throw e;
        if (isValid) return res.redirect('/wxplatform/auth');
      });
    }
    else {
      res.render('index');
    }
  });
  router.post('/apis/user/:action',userRouter);
  // router.post('/apis/file/fileupload',multipartMiddleware,fileRouter);
  router.post('/apis/wxplatform/:action',wxApiRouter);
  router.post('/apis/wxreplymanage/:action',wxReplyRouter);
  server.use(router);
};
