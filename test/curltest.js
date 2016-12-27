var request = require('request');
for (var i =0;i<=40;i++)
{
  (function(num) {
    request.post('http://socialinzen.inzen.com.cn/apis/wxplatform/getGroups?access_token=SWHEAV21ECY6KjkbA92WRpMhQHOQbFOO06uDN1FKgLpcEn0I0nr30VXgxukCUf2u',{},function (e, r) {
      if(e) return cb(e);
      console.log(num);
    })
  })(i);
}


