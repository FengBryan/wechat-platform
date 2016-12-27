var fs = require('fs');
var async = require('async');
var path = require('path');
var mime = require('mime');
var util = require('../../lib/util.js');
var app = require('../../../server.js');
module.exports= function (req,res)
{
   var fileObj = req.files.uploadFile;
  // return res.send(mime.extension(fileObj.type)).end();
  var uid = req.cookies['SocialinzenUser'];
  async.waterfall([
    function (next) {
      if(!uid) return next(util.makeRetMsg(0,'invalid user tag'));
      var User = app.models.User;
      User.findById(uid,function (e, user) {
        if(e) return next(e);
        if (!user) return next(util.makeRetMsg(0,'no such a user,login again'));
        return next(null,user.appid);
      });
    },
    function (appid,next) {
      floderInit(appid);
      if (fileObj.size>20000000) return next(util.makeRetMsg(1003,'limited 20m upload file size'));
      var type = mime.extension(fileObj.type);
      var picTypes = ['jpg','png','jpeg','gif'];
      var mediaTypes = ['mp4','avi','rmvb'];
      for(var key in picTypes){
        if(picTypes[key]==type)
          return next(null,appid,'pic',type);
      }
      for (var key in mediaTypes)
      {
        if(mediaTypes[key] == type)
          return next(null,appid,'media',type);
      }
      return next(util.makeRetMsg(0,'invalid media format'));
    },
    function (appid,floder,type,next) {
      var filename =appid+floder+Date.parse(new Date());
      fs.rename(fileObj.path,path.resolve('./client/files/'+appid)+'/'+floder+'/'+filename+'.'+type,function (e) {
        if(e) return next(e);
        console.log('----rename successfully----');
        var url = 'http://socialinzen.inzen.com.cn/files/'+appid+'/'+floder+'/'+filename+'.'+type;
        return next(null,url);
      });
    }
  ],function (e, result) {
    if(e) return util.throw(e);
    return res.send({url:result}).end();
  });
  // var path = req.files.uploadFile.path;
  // //console.log(path);
  // var renamePath = Path.resolve('../client/files')+'/';
  // var fileName = Date.parse(new Date())+'.png';
  // //console.log(renamePath);
  // async.waterfall([
  //   function(cb)
  //   {
  //     fs.rename(path,renamePath+fileName,function(err){
  //       if (err) return cb(err,path);
  //       cb(null,fileName);
  //     });
  //   }
  // ],function(err,result){
  //   if (err) {
  //     fs.unlinkSync(result);
  //     throw err;}
  //   else { res.send({status:'success',filename:result}).end();}
  // });
}
function floderInit (appid) {
  if(fs.existsSync(path.resolve('./client/files/')+'/'+appid)) return;
  else
  {
    //return console.log(path.resolve('./client/files/')+'/'+appid);
    //return console.log(path.resolve('../../../../client/files'));
    fs.mkdirSync(path.resolve('./client/files/')+'/'+appid);
    fs.mkdirSync(path.resolve('./client/files/')+'/'+appid+'/media');
    fs.mkdirSync(path.resolve('./client/files/')+'/'+appid+'/pic');
    fs.mkdirSync(path.resolve('./client/files/')+'/'+appid+'/others');
    return;
  }
}
