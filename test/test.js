var lt = require('loopback-testing');
var assert = require('assert');
var app = require('../server/server.js');
// console.log(lt);
describe ('/',function () {
  console.log(lt);
  lt.beforeEach.withApp(app);
  lt.describe.whenCalledRemotely('GET','/',function () {
    lt.it.shouldBeAllowed();
    it('should have statusCode 200', function(done) {
      assert.equal(this.res.statusCode, 200);
      done();
    });
  });
});
describe('/apis/*',function () {
  lt.beforeEach.withApp(app);
  lt.beforeEach.givenLoggedInUser({email:'test2@inzen.com.cn',password:'noMoreSha11'});
  describe ('/apis/wxplatform/auth',function () {
    lt.describe.whenCalledRemotely('GET','/apis/wxplatform/auth',function () {
      lt.it.shouldBeAllowed();
      it('should have statusCode 200', function(done) {
        assert.equal(this.res.statusCode, 200);
        done();
      });
    })
  })
});
