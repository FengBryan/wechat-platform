# Social Inzen Wechat Open Platform
---------------------------------
##REST API 列表：
#用户权限api
*登陆*：/apis/user/login
请求方法:post 
数据格式:application/x-www-form-urlencoded 
参数:json
{username:用户名,password:密码}
回复:
cookies:
SocialinzenToken———用户accessToken
SocialinzenUser————用户id
*登出*：/apis/user/logout
请求方法:post
数据格式:application/x-www-form-urlencoded 
参数：无（单请求客户端需有cookies残留）
回复：json {errcode:错误编码,msg:错误信息}
*注册:*
请求方法:post
数据格式:application/x-www-form-urlencoded
参数: json 
{username:用户名,password:密码,email:用户邮件}
回复:json {errcode:错误编码,msg:错误信息}并会发送一封验证邮件至用户邮箱，点击右键验证后方可登录。
#回复管理接口
