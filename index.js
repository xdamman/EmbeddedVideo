var twitter = require('twitter')
  , env = process.env.NODE_ENV || "development"
  , request = require('request')
  , utils = require('./lib/utils')
  , settings = require('./settings.'+env+'.json');

var twit = new twitter(settings.twitter);


var sendTweetReply = function(in_reply_to_status_id, text, cb) {
    var form, r;
    var oauthKeys = {
      consumer_key: settings.twitter.consumer_key,
      consumer_secret: settings.twitter.consumer_secret,
      token: settings.twitter.access_token_key,
      token_secret: settings.twitter.access_token_secret
    };
    r = request.post("https://api.twitter.com/1.1/statuses/update.json", {oauth: oauthKeys}, cb);
    form = r.form();
    form.append('status', text);
    form.append('in_reply_to_status_id', in_reply_to_status_id);
    r.on('error', function(e) {
      console.error("Error while sending the tweet: ", e);
    });
  }

function processTweet(tweet) {

  if(!tweet.entities) return;
  if(!tweet.entities.urls || tweet.entities.urls.length == 0) return;
  if(tweet.user.screen_name == 'EmbeddedVideo') { 
    console.log("tweet from EmbeddedVideo: ", tweet);
    return;
  }

  var url = tweet.entities.urls[0].expanded_url;

  console.log("Getting HTML page for ", url);
  utils.getHTML(url, function(e, html) {
    var videoUrl = utils.getVideoUrl(html);

    if(!videoUrl) {
      console.log("No video found in "+url);
      return;
    }

    utils.getHTML(videoUrl, function(e, html) {
      var title = utils.getTitle(html);

      title = title.replace(" - YouTube","");
      title = title.replace(" on Vimeo","");

      var via = "On @"+tweet.user.screen_name+":";
      var text = title.smart_truncate(119-via.length);

      text = via + " " + text + " " + videoUrl

      var hashtag = "#SavedYouAClick";

      if((text+hashtag).length < 119) text+= " " + hashtag;

      console.log("Sending tweet to ", tweet.id_str, text);
      sendTweetReply(tweet.id_str, text, function(err, result) {
        console.log("Tweet sent", err);
      });
    });
  });

};

twit.stream('user', function(stream) {

  stream.on('data', function(data) {

    // We don't process retweets, just interested in original tweets
    // var tweet = data.retweeted_status || data;
    if(data.retweeted_status) return;

    // We don't process tweets that mention @EmbeddedVideo
    if(data && data.text && data.text.match(/@EmbeddedVideo/i)) return;

    var tweet = data;

    console.log("\n-----------------------------------------------------------------------------\n");

    if(tweet.user) {
      console.log("Tweet from : "+tweet.user.screen_name, tweet.text);
      processTweet(tweet);
    }

  });

  stream.on('error', function(e) {
    console.error("Error in twitter stream", e);
    process.exit(1);
  });

  stream.on('end', function(e) {
    console.log("Twitter stream ended -- exiting");
    process.exit(1);
  });

});
