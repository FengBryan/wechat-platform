module.exports = function (type) {
  switch (type) {
    case 'text'     :
      return text;
      break;
    case 'image'  :
      return image;
      break;
    case 'video'    :
      return video;
      break;
    case 'music'    :
      return music;
      break;
    case 'multitext':
      return multitext;
      break;
    case 'voice'    :
      return voice;
      break;
    case 'types'    :
      return types;
      break;
    default:
      return "error no such type";
      break;
  }
}
var types =
  {
    _typelist: ['text', 'image', 'video', 'music', 'multitext', 'voice'],
    get: function () {
      return this._typelist;
    }
  }
var text =
  {
    data:{type: 'text',
          content: ''},
    set: function (content) {
      if (content) {
        this.data.content = content;
      } else {
        this.data.type = 'error';
        this.data.content = 'empty content';
      }
    },
    get: function () {
      if (this.data.content) {
        return this.data;
      } else {
        return 'empty content'
      }
    }
  }
var image =
  {
    data:{type: 'image',
    content: {
      mediaId: ''
    }},
    set: function (content) {
      if (content.mediaId) {
        this.data.content.mediaId = content.mediaId
      }
      else {
        return 'error empty imageId'
      }
    },
    get: function () {
      if (this.data.content.mediaId) {
        return this.data;
      }
      else {
        return ' error empty imageId'
      }
    }
  }
var vedio =
  {
    data:
      {type: 'vedio',
     content: {
      title: '',
      description: '',
      mediaId: ''
    }},
    set: function (content) {
      if (content.title && content.description && content.mediaId) {
        this.data.content.title = content.title;
        this.data.content.description = content.description;
        this.data.content.mediaId = content.mediaId;
      }
      else {
        return 'error empty params'
      }
    },
    get: function () {
      if (this.data.title && this.data.description && this.data.mediaId) {
        return this.data;
      } else {
        return 'error no such object'
      }
    }
  }
var music =
  {
    data:{title: "",
      description: "",
      musicUrl: "",
      hqMusicUrl: "",
      thumbMediaId: ""},
    set: function (content) {
      if (content.musicUrl && content.title && content.description && content.hqMusicUrl && content.thumbMediaId) {
        this.data.title = content.title;
        this.data.description = content.description;
        this.data.musicUrl = content.musicUrl;
        this.data.thumbMediaId = content.thumbMediaId;
        this.data.hqMusicUrl = content.hqMusicUrl;
      } else {
        return 'error wrong params'
      }
    },
    get: function () {
      if (this.data.title && this.data.description && this.data.musicUrl && this.data.thumbMediaId && this.data.hqMusicUrl) {
        return this.data;
      } else {
        return 'error no set'
      }
    }
  }
var multitext =
  {
    data:{title: '',
      description: '',
      picurl: '',
      url: ''},
    set: function (content) {
      if (content.title && content.description && content.picurl && content.url) {
        this.data.title = title;
        this.data.description = description;
        this.data.picurl = picurl;
        this.data.url = url;
      }
    },
    get: function () {
      if (this.data.title && this.data.description && this.data.picurl && this.data.url) {
        return this.data;
      }
    }
  }
var voice =
  {
    data:{type: 'voice', content: {mediaId: ""}},
    set: function (content) {
      if (content.mediaId) {
        this.data.content.mediaId = content.mediaId;
      }
    },
    get: function () {
      if (this.data.content.mediaId) {
        return this.data;
      }
    }
  }
