var request = require('request')
  , entities = require('entities');

String.prototype.smart_truncate = function(n){
   var toLong = this.length>n,
       s_ = toLong ? this.substr(0,n-1) : this;
   s_ = toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
   return  toLong ? s_ +'...' : s_;
};

module.exports = {

  getHTML: function(url, cb) {

    var html = '';
    var stream = request(url);
    stream.on('error', function(e) {
      console.error("Error while getting HTML", url, e);
      return cb(e);
    });

    stream.on('data', function(data) {
      html += data.toString();
    });

    stream.on('end', function() {
      return cb(null, html);
    });

  },

  getTitle: function(html) {
    var matches=html.match(/<title>(.*)<\/title>/i);
    if(matches && matches.length > 1) return entities.decodeHTML(matches[1]);

    return '';
  },

  getVideoUrl: function(html) {

    var videoId, videoUrl;

    // VINE
    var matches = html.match(/vine-embed[^>]*src="https?:\/\/vine\.co\/v\/([^\/]+)/);
    if(matches && matches.length > 1) {
      videoId = matches[1];
      videoUrl = "https://vine.co/v/"+videoId;
      return videoUrl;
    }

    // VIMEO
    var matches = html.match(/player\.vimeo\.com\/video\/([0-9]+)/i);
    if(matches && matches.length > 1) {
      videoId = matches[1];
      videoUrl = "https://vimeo.com/"+videoId;

      return videoUrl;
    }

    // YOUTUBE
    var matches = html.match(/youtube\.com\/embed\/([^\?"]+)/i)
    if(matches && matches.length > 1) {
      videoId = matches[1];
      videoUrl = "https://youtube.com/watch?v="+videoId;
      return videoUrl;
    }

    return null;
  }


};
