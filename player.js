playlist = new Meteor.Collection("playlist");

if (Meteor.is_client) {
  Meteor._reload.onMigrate(function () {
    return false;
  });

  function sendhash(hsh){
    var hashnow = parsehash();
    hashnow = $.extend(hashnow, hsh);
    window.location.hash = 
      '#' + encodeURIComponent(JSON.stringify(hashnow));
  };

  function parsehash() {
    
    window.hashdata = null;
    try {
      
      hashdata = location.hash &&
	(location.hash.indexOf('message') > 0 || location.hash.indexOf('playlist')) ?
	JSON.parse(decodeURIComponent(location.hash.substr(1))) : {
	};
      return hashdata;
    } catch (e) {
      
      return null;
    }
  }

  window.geturl = function(e, returnf){
    var id = e.id.replace('li-', '');
    if (('' + id).length < 5) {
      returnf();
      return;
    }
    var player = $(e).attr('player');
    if (player === 'yt') {
      $.ajax({url: 
	      'https://gdata.youtube.com/feeds/api/videos/' +
	      id + '?v=2&alt=json&bust=' + (new Date()).getTime(),
	      cache: false,
	      dataType: "json",
	      success: function(t,x) {                
                var isembed = true;
                _.each(t.entry.yt$accessControl, function(ac){
                  if (ac.action === 'embed' && ac.permission !== 'allowed') {
                    isembed = false;
                  }
                });
                
                if (!isembed) {
                  returnf(null);
                  return;
                }

                returnf('//www.youtube.com/v/' + id + '?autoplay=1');
	      },
              error: function(){
                returnf(null);
                return;
              }
             });

    }
    else if (player === 'sc') {
      $.get('//api.soundcloud.com/tracks/' + id +  '.json?client_id=YOUR_CLIENT_ID', {format: "json"}, function(data) {
        returnf(data.permalink_url);
      }).fail(function(){
        returnf(null);
        return;
      });
    }
    else if (player === 'vm') {
      returnf('//www.vimeo.com/' + id);
    }
  };

  window.getthumb = function() {
    var that = this;

    if (this.player === 'yt') {
      $.ajax({url: 
	      'https://gdata.youtube.com/feeds/api/videos/' +
	      this.id + '?v=2&alt=json&bust=' + (new Date()).getTime(),
	      cache: false,
	      dataType: "json",
	      success: function(t,x) {                
		$('#li-' + that.id)
		  .attr('data-original-title', t.entry.title.$t)
		//.attr('data-content', t.entry.media$group.media$description.$t)
		  .attr('data-content', 'views: ' +
			t.entry.yt$statistics.viewCount)
		  .popover();
                $('#img-' + that.id).attr('src',  "//img.youtube.com/vi/" + that.id + "/0.jpg");
		$(document).trigger(that.id + '-ready');
	      }});

      return "//img.youtube.com/vi/" + this.id + "/0.jpg";
    }
    else if (this.player === 'vm') {

      $.getJSON('//www.vimeo.com/api/v2/video/' + this.id + '.json?callback=?', {format: "json"}, function(data) {
	$('#img-' + that.id).attr('src', data[0].thumbnail_large);
        $('#li-' + that.id)
	  .attr('data-original-title', data[0].title)
	  .attr('data-content', '');

	$(document).trigger(that.id + '-ready');
      });
      return '';
    }
    else if (this.player === 'sc') {

      $.get('//api.soundcloud.com/tracks/' + that.id +  '.json?client_id=YOUR_CLIENT_ID', {format: "json"}, function(data) {
        $('#li-' + that.id)
          .attr('data-original-title', data.title)
	  .attr('data-content', '');

	$('#img-' + that.id).attr('src', data.artwork_url);
	$(document).trigger(that.id + '-ready');
      });
      return '';
    }

  };

  Template.foo.list = function () {
    
    var hashnow = parsehash();
    window.hash = hashnow;
    var dups = {};
    var parsed = $.map(window.hash.playlist, function(x){
      x = JSON.parse(x);
      if (dups[x.id]){
	return null;
      }
      dups[x.id] = x;
      x['image'] = getthumb;
      return x;
    });
    
    return parsed;
  };

  window.loop = false;
  Meteor.startup(function () {

    $('body')
      .on('mouseenter', ".mycarousel ul", function(e) {
        // get left offset of div on page
        $(window).on('mousemove', function(e) {
          // get percent of height the mouse position is at
          var percent = (e.pageY - 100) / ($(window).height() - 100);
          // set margin-left on ul to achieve a 'scroll' effect
//          $('.mycarousel').scrollTop(percent * $('.mycarousel ul').height());

        });
      })
      .on('mouseleave', function() {
        // remove mousemove event
        $(window).off('mousemove');
      })
      .on('click', '#prev', function(){
        $(window.ce).prev()[0] && playel($(window.ce).prev()[0]);
      })
      .on('click', '#next', function(){
        $(window.ce).next()[0] && playel($(window.ce).next()[0]);
      })      
      .on('click', '#loop', function(){
        window.loop = !window.loop;
        $(this).toggleClass('btn-warning').toggleClass('btn-info');
      });

    $('body')
      .on('click touchstart', ".mycarousel li", function() {
        console.log("XX");
       window.playel = function(e) {
	  
	  var percent = $(e).position().top / $(window).height();
	  
	  // set margin-left on ul to achieve a 'scroll' effect
//	  $('.mycarousel').scrollTop(percent * ($(window).height() + 315));
          
          var smoothnext = false;
	  var eready = $.data(e, 'ready');
          try {
            if (window.pop) {
              if (window.pop.options.youtubeObject) {
                smoothnext = true;
              }
              else {
                window.pop.destroy();            
	        $('#video').html('');
              }
            }
          } catch (x) {
            
          }
	  var id = e.id.split('li-')[1];
	  $('li.selected').removeClass('selected');
	  $(e).addClass('selected');
	  if ($(e).attr('data-original-title')) {
	    $('.top .title').text($(e).attr('data-original-title'));
	  }
	  else {
	    $(document)
	      .bind(id +
		    '-ready', function() {
		      $('.top .title').text($(e).attr('data-original-title'));
		    });
	    
	  }


	  window.nowplaying = id;
          //	sendhash({lastWatched: id});
         window.top.postMessage({'nowplaying': id}, '*');
          window.ce = e;
          playUrl = function(u){
            if (!smoothnext) {
              window.pop = Popcorn.smart("#video", u);   
	      pop.media.addEventListener("ended", function() {
                if (window.loop) {
                  playel(window.ce);
                }
                else {
                  $(window.ce).next()[0] && playel($(window.ce).next()[0]);   
                }
	      });

            }
            else {

              window.pop.options.youtubeObject.loadVideoByUrl(u);
            }
	    

          };

          var url = $(e).attr('url');
          if (url) {
            playUrl(url);
          }
          else {
            window.geturl(e, function(u){
              if (!u) {
                playel($(e).next()[0]);
                return;
              }
              $(e).attr('url', u);
              playUrl(u);
            });
          }
        }

        playel(this);

      });


    var hashnow = parsehash();
    if (hashnow.nolist) {
        $('#video').css('width', '99%');
        $('.jcont').hide();
    }

    $(window).bind('hashchange', function() {
      var hashnow = parsehash();
      if (hashnow.lastWatched) {
        $('#li-' + hashnow.lastWatched).click();
      }
    });
    
    if (hashnow.lastWatched) {
      $('#li-' + hashnow.lastWatched).click();
    }
    else {
      $($('.mycarousel li')[0]).click();   
    }

  });
}