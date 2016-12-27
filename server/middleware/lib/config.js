/**@describtion: wechat open platform config
 *
 * @type {{
 * private _COMPONENT_APPID: string,  wechat open platform appid
 * private _TOKEN: string,  decode token for wechat message
 * pirvate _ENCODING_AES_KEY: string, decode key for wechat message
 * static getAppid: Function,
 * static getToken: Function,
 * static getKey: Function
 *}}
 *
 */
module.exports={
  _COMPONENT_APPID:'wx281c04257f562494',
  _TOKEN:'Social1n2eN',
  _ENCODING_AES_KEY:'7a6UaqZmyu6wftxRqS0SQSIbcKQ7269bJLpDXaykIQs',
  _AUTH_KEY:'Social1n2eNaUthKey',
  getAppid:function ()
  {
    return this._COMPONENT_APPID;
  },
  getToken:function()
  {
    return this._TOKEN;
  },
  getKey:function()
  {
    return this._ENCODING_AES_KEY;
  },
  getAuthKey: function()
  {
    return this._AUTH_KEY;
  }
}
