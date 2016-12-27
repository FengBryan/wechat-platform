var openApi = require('./lib/openApi.js');
var util = require('../lib/util.js');
var async = require('async');
var fs = require('fs');
var mime = require('mime');
var checkToken = require('../admin/user/userAccess.js');
module.exports = function (req, res) {
  checkToken(req.accessToken,function (e, user) {
    if (e) return util.throw(e, res);
    openApi(user.appid,function (err, api) {
      if (err) return util.throw(err, res);
      var action = req.params.action;
      switch (action) {
        case 'uploadMaterial':
          uploadMaterial(req, res, user, api);
          break;
        case 'uploadVideoMaterial':
          uploadVideoMaterial(req, res, user, api);
          break;
        case 'removeMaterial' :
          removeMaterial(req, res, user, api);
          break;
        case 'getMaterialCount' :
          getMaterialCount(req, res, user, api);
          break;
        case 'getMaterialByType':
          getMaterialByType(req, res, user, api);
          break;
        case 'uploadLogo':
          uploadLogo(req,res);
          break;
        //case 'uploadMedia':uploadMedia(req,res);break;
      }
    });
  });
}
function uploadMaterial(req, res, user, api) {
  async.waterfall([
    function (next) {
      var type = req.body.type;
      var file = req.files.materialFile;
      var typesList = ['image', 'thumb', 'voice'];
      var flag = false;
      for (var key in typesList) {
        if (typesList[key] == type) flag = true;
        break;
      }
      if (!flag) return next(util.makeRetMsg(0, 'invalid type arg'));
      if (!type || !file) return next(util.makeRetMsg(0, 'no require args'));
      if ((type == 'image') && (file.size > 2000000)) return res.send(0, 'image file size is limited 2m');
      if ((type == 'voice') && (file.size > 2000000)) return res.send(0, 'voice file size is limited 2m');
      if ((type == 'thumb') && (file.size > 64000)) return res.send(0, 'thumb file size is limited 64kb');
      if ((type == 'thumb') && (mime.extension(file.type) != 'jpg')) return res.send(0, 'voice file type is limited jpg');
      api.uploadMaterial(file.path, type, function (e, material) {
        if (e) return next(e);
        fs.unlinkSync(file.path);
        console.log(material);
        return next(null, material, type);
      });
    },
    function (material, type, next) {
      var materialObj = {
        appid: user.appid,
        mediaId: material.media_id,
        type: type,
        url: material.url
      }
      user.materials.create(materialObj, function (e, ins) {
        if (e) return next(e);
        return next(null, ins);
      });
    }
  ], function (e, r) {
    if (e) return util.throw(e, res);
    return res.send(util.makeRetMsg(200, 'upload material successfully')).end();
  });
}
function uploadVideoMaterial(req, res, user, api) {
  async.waterfall([
    function (next) {
      var file = req.files.materialFile;
      var title = req.body.title;
      var desc = req.body.desc;
      if (!file || !title || !desc) return next(util.makeRetMsg(0, 'no require args'));
      if (mime.extension(file.type) != 'mp4') return res.send(0, 'vedio file type is limited mp4');
      var description = {
        "title": title,
        "introduction": desc
      };
      api.uploadVideoMaterial(file.path, description, function (e, material) {
        if (e) return next(e);
        fs.unlinkSync(file.path);
        return next(null, material, user, description);
      });
    },
    function (material, user, desc, next) {
      var materialObj = {
        appid: user.appid,
        mediaId: material.media_id,
        type: 'vedio',
        url: 'empty',
        desc: desc
      }
      user.materials.create(materialObj, function (e, ins) {
        if (e) return next(e);
        return next(null, ins);
      });
    }
  ], function (e, r) {
    if (e) return util.throw(e, res);
    return res.send(util.makeRetMsg(200, 'upload material successfully')).end();
  });
}
function removeMaterial(req, res, user, api) {
  async.waterfall([
    function (next) {
      var mediaId = req.body.mediaId;
      if (!mediaId) return next(util.makeRetMsg(0, 'no require args'));
      api.removeMaterial(mediaId, function (e, r, resp) {
        if (e) return next(e);
        return next(null, user, mediaId)
      });
    },
    function (user, mediaId, next) {
      user.materials.destroy(mediaId, function (e) {
        if (e) return next(e);
        return next();
      });
    }
  ], function (e) {
    if (e) return util.throw(e, res);
    return res.send(util.makeRetMsg(200, 'delete material successfully'));
  });
}
function getMaterialCount(req, res, user, api) {
  async.waterfall([
      function (next) {
        api.getMaterialCount(function (e, r, resp) {
          if (e) return next(e);
          return next(null, r);
        });
      }
    ],
    function (e, r) {
      if (e) return util.throw(e, res);
      return res.send(r).end();
    });
}
function getMaterialByType(req, res, user, api) {
  async.waterfall([
    function (next) {
      user.materials({where: {type: req.body.type}}, function (e, materials) {
        if (e) return next(e);
        if (materials.length < 1) return next(util.makeRetMsg(2, 'no this type materials'));
        return next(null, materials);
      });
    }
  ], function (e, materials) {
    if (e) return util.throw(e, res);
    return res.send(materials).end();
  });
}
function uploadLogo(req,res,user,api) {
  async.waterfall([
    function (next) {
      var file = req.files.logolFile;
      if(!file) return res.send(util.makeRetMsg(0,'invalid file'));
      api.uploadLogo(file,function (e, resp) {
        if(e) return next(e);
        if(resp.errcode!=0) return next(resp);
        return next(null,resp);
      });
    }],function (e, logo) {
    if(e) return util.throw(e,res);
    else return res.send(logo.url).end();
  });
}
