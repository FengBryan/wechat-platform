var Followers = {};
var util = require('../lib/util.js');
var app = require('../../server.js');
Followers.updateRemark = function (req, res, api) {
  var openid = req.body.openid;
  var remark = req.body.remark;
  if(!openid || openid.length!=28  ) return res.send(util.makeRetMsg(0,'invalid openid'));
  if(!remark || remark.length>30) return res.send(util.makeRetMsg(0,'invalid remark'));
  api.updateRemark(openid,remark,function (e, resp) {
    if(e) return util.throw(e,res);
    if(resp.errcode!==0) return util.throw(resp,res);
    else return res.send(util.makeRetMsg(200,'make remark to follower succcessfully'));
  })
}
Followers.getGroups = function (req, res, api) {
  api.getGroups(function (e, body) {
    if(e) return util.throw(e,res);
    return res.send(body).end();
  });
}
  Followers.getWhichGroup = function (req, res, api) {
  var openid = req.body.openid;
  if(!openid || openid.length!=28  ) return res.send(util.makeRetMsg(0,'invalid openid'));
  api.getWhichGroup(openid,function (e, body) {
    if(e) return util.throw(e,res);
    return res.send(body).end();
  })
}
Followers.createGroup = function (req, res, api) {
  var groupName = req.body.groupName;
  if(!groupName || /^[a-zA-Z]\w{3,15}$/ig.test(groupName)) return res.send(util.makeRetMsg(0,'invalid group name'));
  api.createGroup(groupName,function (e, body) {
    if(e) return util.throw(e,res);
    return res.send(util.makeRetMsg(200,'create group '+groupName+' successfully')).end();
  })
}
Followers.updateGroup = function (req, res, api) {
  var groupName = req.body.groupName;
  if(!groupName || /^[a-zA-Z]\w{3,15}$/ig.test(groupName)) return res.send(util.makeRetMsg(0,'invalid group name'));
  var groupId = req.body.groupId;
  if(!groupId || !/^\d+$/.test(groupId)) return res.send(util.makeRetMsg(0,'invalid group id'));
  api.updateGroup(Number(groupId),groupName,function (e,resp) {
    if(e) return util.throw(e,res);
    if(resp.errcode!==0) return util.throw(resp,res);
    else return res.send(util.makeRetMsg(200,'update group name succcessfully'));
  })
}
Followers.moveUserToGroup = function (req, res, api) {
  var groupId = req.body.groupId;
  if(!groupId || !/^\d+$/.test(groupId)) return res.send(util.makeRetMsg(0,'invalid group id'));
  var openid = req.body.openid;
  if(!openid || openid.length!=28  ) return res.send(util.makeRetMsg(0,'invalid openid'));
  api.moveUserToGroup(openid, groupId, function(e,body){
    if(e) return util.throw(e,res);
    if(body.errcode!==0) return util.throw(body,res);
    else return res.send(util.makeRetMsg(200,'move  user to group succcessfully'));
  });
}
Followers.removeGroup = function (req, res, api) {
  var groupId = req.body.groupId;
  if(!groupId || !/^\d+$/.test(groupId)) return res.send(util.makeRetMsg(0,'invalid group id'));
  api.removeGroup(groupId, function (e, resp) {
    if(e) return util.throw(e,res);
    if(resp.errcode!==0) return util.throw(resp,res);
    else return res.send(util.makeRetMsg(200,'remove group  succcessfully'));
  });
}
Followers.getFollowersByGroup = function (req, res, api,user) {
  var groupId = req.body.groupId;
  if(!groupId || !/^\d+$/.test(groupId)) return res.send(util.makeRetMsg(0,'invalid group id'));
    user.wxFollowers({where:{groupid:groupId}},function (e, followers) {
      if(e) return util.throw(e,res);
      if(!followers) return res.send([]);
      return res.send(followers);
    });
}
module.exports= Followers;
