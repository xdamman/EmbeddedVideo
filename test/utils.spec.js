var utils = require('../lib/utils');
var expect = require('chai').expect;

var url = "http://www.upworthy.com/to-help-the-worlds-kids-stay-healthy-people-got-thinky-and-what-they-came-up-with-is-super-smart";
var html;

describe('utils', function() {

  it('downloads the html of a page', function(done) {
    utils.getHTML(url, function(e, content) {
      expect(e).to.not.exist;
      html = content;
      expect(html.length > 20000).to.be.true;
      done();
    });
  });

  it('gets the title from the html', function() {
    var title = utils.getTitle(html);
    expect(title).to.equal('To Help The World’s Kids Stay Healthy, People Got Thinky, And What They Came Up With Is Super-Smart');
  });

});

describe("Vimeo", function() {
  it('gets the video url from the html', function() {
    var videoUrl = utils.getVideoUrl(html);
    expect(videoUrl).to.equal("https://vimeo.com/96580414");
  });
});

describe("Vine", function() {
  it('gets the video url from the html', function() {
    utils.getHTML("http://mashable.com/2014/08/23/iggy-azalea-falls-vmas-fancy", function(e, html) {
      var videoUrl = utils.getVideoUrl(html);
      expect(videoUrl).to.equal("https://vine.co/v/MLjuHLXUEmM");
    });
  });
});

describe("YouTUBE", function() {
  it('gets the video url from the html', function(done) {
    utils.getHTML("http://www.theverge.com/2014/8/7/5977917/ronaldo-puts-his-face-behind-absurd-japanese-smile-enhancer", function(e, html) {
      var videoUrl = utils.getVideoUrl(html);
      expect(videoUrl).to.equal("https://youtube.com/watch?v=1c4O6FlEktc");
      done();
    });
  });

  it('gets the video url from the html when there is no ?params', function(done) {
    utils.getHTML("http://huff.to/1sldfLI", function(e, html) {
      var videoUrl = utils.getVideoUrl(html);
      expect(videoUrl).to.equal("https://youtube.com/watch?v=-e-VKjl72z4");
      done();
    });
  });

  it('gets the video url from mashable', function(done) {
    utils.getHTML("http://on.mash.to/1Dv1Rj4", function(e, html) {
      var videoUrl = utils.getVideoUrl(html);
      expect(videoUrl).to.equal("https://youtube.com/watch?v=oFK4BIsULKQ");
      done();
    });
  });


});
