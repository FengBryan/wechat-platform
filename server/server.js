//req.headers['user-agent'].indexOf("MicroMessenger") >= 0 ? 'Platform.Weixin' : 'platform'
//var multipart = require('connect-multiparty');
//var multipartMiddleware = multipart();
//var content = require('./middleware/content/co
var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var app = module.exports = loopback();
var xmlparser = require('express-xml-bodyparser');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var fileUpload = require('./middleware/admin/file/fileUpload.js');
var verify = require('./middleware/wxPlatForm/verify.js');
var wxplatform = require('./middleware/wxPlatForm/platformRouter.js');
var webot_route = require('./middleware/wxPlatForm/replyRouter.js');
var materialRouter = require('./middleware/wxPlatForm/wxPlatformMaterial.js');
var config = require('./middleware/lib/config.js');
var wechat = require('wechat');
var cookieParser  = require('cookie-parser');
var log4js = require('log4js');
var path = require('path');
var webot_config = {
  token          : config.getToken(),
  appid          : config.getAppid(),
  encodingAESKey : config.getKey()
}
// waiting for log4js logger middware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(loopback.token());
app.use(cookieParser('Social1nzen'));
app.use(bodyParser.json());
app.use(xmlparser());
app.use(bodyParser.urlencoded({extended:true}));
//app.use(auth);
//app.use(check);
//console.log(Wxplatform.cache_js_ticket);
//return;
app.use('/platform/:appid/callback',wechat(webot_config,webot_route));
app.post('/apis/files/fileUpload',multipartMiddleware,fileUpload);
app.post('/apis/materials/:action',multipartMiddleware,materialRouter);
app.post('/verify/callback',verify.checkTicket);
app.get('/wxplatform/:action',wxplatform.start);
app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
//app.post('/wechat/settings',wx.settings);
//app.get('/home',wx.home);
//app.get('/api/getdefault',wx.settingsDefault);
//app.post('/api/getticket',ticket.get);
//app.post('/api/ticketreset',ticket.reset);
//app.post('/content/create',content.createNewType);
//app.get('/test/modeltest',wx.test);
//app.get('/content/getalltype',content.getAllType);
//app.post('/content/savenewdata',multipartMiddleware,content.saveNewData);
//app.post('/content/getalldata',content.getAllData);


//app.get('/wxplatform/gettoken',Wxplatform.component_access_token.getToken);
//app.get('/wxplatform/getprecode',Wxplatform.pre_auth_code.getCode);
//app.get('/wxplatform/getauthcode',Wxplatform.authorization_code.getCode);
//app.get('/wxplatform/getinfo',Wxplatform.authorizer_access_token.getToken);
//app.get('/wxplatform/getauthtoken',Wxplatform.cache_auth_token.getToken);
//app.post('/wxplatform/setmsgrules',Wxplatform.message_reply.setRules);
//app.post('/wxplatform/getjsticket',Wxplatform.cache_js_ticket.getTicket);
//app.post('/wxplatform/settings',Wxplatform.getsettings.get);
//app.post('/wxplatform/:action',wxplatform.start);
//app.post('/user/api/login',user_route.login);
//app.post('/user/api/register',user_route.register);
//app.get('/author',wx.author);
//app.get('/wxverify',wxserver.getMsg);
//var Wxplatform = require('./middleware/wechat_platform')();
