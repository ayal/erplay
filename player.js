playlist = new Meteor.Collection("playlist");

clean = function (e,t){return t?e?e.toLowerCase().replace(/^the\s|\sthe\s|\sand\s| ep$/gim," ").replace(/part/gim,"pt").replace(RegExp("[^\\p{L}a-zA-Z0-9]","gim"),"").replace("around","round").trim(" "):"":e?e.toLowerCase().replace(/^the\s|\sthe\s|\sand\s| ep$/gim," ").replace(/\(.*?\)/gim,"").replace(/part/gim,"pt").replace(RegExp("[^\\p{L}a-zA-Z0-9]","gim"),"").replace("around","round").trim(" "):""} 

if (Meteor.isClient) {
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
	Session.set('mute', hashdata.mute);
      Session.set('hashchange',location.hash);
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
        returnf('//www.youtube.com/v/' + id + '?autoplay=1&controls=1');
    }
    else if (player === 'sc') {
	returnf(id);
    }
    else if (player === 'vm') {
      returnf('//www.vimeo.com/' + id);
    }
  };

  window.getthumb = function() {
    var that = this;

    if (this.player === 'yt') {
    }
    else if (this.player === 'vm') {
    }
    else if (this.player === 'sc') {
    }

  };

    Template.top.muteclass = function(){
	return Session.get("mute") ? "active" : "notactive" ;
    };

  Template.foo.list = function () {
      var hashchange = Session.get('hashchange');
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
        $('#li-' + window.nowplaying).prev()[0] && playel($('#li-' + window.nowplaying).prev()[0]);
      })
      .on('click', '#next', function(){
        $('#li-' + window.nowplaying).next()[0] && playel($('#li-' + window.nowplaying).next()[0]);
      })      
      .on('click', '#loop', function(){
        window.loop = !window.loop;
        $(this).toggleClass('btn-warning').toggleClass('btn-info');
      }).on('click', '#mute', function(){
	  Session.set('mute', !Session.get('mute'));
	  if (Session.get('mute')) {
	      pop.volume(0);
	  }
	  else {
	      pop.volume(0.5);
	  }
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
	       var short  = $(e).attr('data-original-title').replace(/\(.*?\)/gim,'');
	       $('.top .title').text(short);
	   }
	   $(document).bind(id + '-ready', function(){
	       if ($(e).attr('data-original-title') && id === window.nowplaying) {
		   var short  = $(e).attr('data-original-title').replace(/\(.*?\)/gim,'');
		   $('.top .title').text(short);
	       }
	   });



	  window.nowplaying = id;
          //	sendhash({lastWatched: id});
         window.top.postMessage({'nowplaying': id}, '*');
          playUrl = function(u){
            if (!smoothnext) {
		window.pop = Popcorn.smart( "#video", u);
		if (Session.get('mute')) {
		    pop.volume(0);
		}
		else {
		    pop.volume(0.5);
		}
		pop.play();

	      pop.on("ended", function() {
                  if (window.loop) {
		    playel($('#li-' + window.nowplaying));
                }
                else {
                    $('#li-' + window.nowplaying).next()[0] && playel($('#li-' + window.nowplaying).next()[0]);   
                }
	      });

            }
            else {

              window.pop.options.youtubeObject.loadVideoByUrl(u);
            }
	    

          };

          var url = $(e).attr('url');
	   $('.top .title').text( $(e).attr('title'));
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
        $('#video').css('width', '100%');
        $('.jcont').hide();
    }

    $(window).bind('hashchange', function() {
      var hashnow = parsehash();
	if (!hashnow.queue) {
	    setTimeout(function(){
            $('#li-' + hashnow.lastWatched).click();
	    },0);
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