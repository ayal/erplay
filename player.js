playlist = new Meteor.Collection("playlist");

if (Meteor.is_client) {

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

    window.geturl = function(){
	if (this.player === 'youtube_player') {
	    return 'http://www.youtube.com/watch/' + this.id;
	}
    };

    window.getthumb = function() {
	var that = this;

	if (this.player === 'youtube_player') {
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
			$(document).trigger(that.id + '-ready');
		    }});

	    return "http://img.youtube.com/vi/" + this.id + "/0.jpg";
	}
	else if (this.player === 'vimeo') {

	    $.getJSON('http://www.vimeo.com/api/v2/video/' + this.id + '.json?callback=?', {format: "json"}, function(data) {
			  
			  $('#img-' + that.id).attr('src', data[0].thumbnail_large);
			  $(document).trigger(that.id + '-ready');
		      });
	    return '';
	}
	else if (this.player === 'soundcloud') {

	    $.get('http://api.soundcloud.com/tracks/' + that.id +  '.json?client_id=YOUR_CLIENT_ID', {format: "json"}, function(data) {
		      $('#img-' + that.id).attr('src', data.artwork_url);
		      $(document).trigger(that.id + '-ready');
		  });
	    return '';
	}

    };

    Template.foo.list = function () {
	/*	return  [
	 {
	 id: 'why-sod-in-the-seed',
	 url: 'http://soundcloud.com/anticon/why-sod-in-the-seed',
	 player: 'soundcloud',
	 image: getthumb
	 },
	 
	 {
	 id: '2VRd6yALNpU',
	 url: 'http://www.youtube.com/watch?v=2VRd6yALNpU',
	 player: 'youtube',
	 image: getthumb
	 },
	 {
	 id: '30861381',
	 url: 'http://vimeo.com/30861381',
	 player: 'vimeo',
	 image: getthumb
	 }
	 ];*/
	var hashnow = parsehash();
	var dups = {};
	var parsed = $.map(hashnow.playlist, function(x){
			       x = JSON.parse(x);
			       if (dups[x.id]){
				   return null;
			       }
			       dups[x.id] = x;
			       x['image'] = getthumb;
			       x['url'] = geturl;
			       return x;
			   });
	return parsed;
    };

    Meteor.startup(function () {


$('.mycarousel ul')
    .on('mouseenter', function(e) {
        // get left offset of div on page
        $(window).on('mousemove', function(e) {
            // get percent of height the mouse position is at
            var percent = (e.pageY - 50) / ($(window).height() - 50);
console.log(percent);
            // set margin-left on ul to achieve a 'scroll' effect
            $('.mycarousel').scrollTop(percent * $('.mycarousel ul').height());

        });
    })
    .on('mouseleave', function() {
        // remove mousemove event
        $(window).off('mousemove');
    });


		       // $('.jcarousel').jcarousel({
		       // 				     // Configuration goes here
		       // 				 });


		       $('.mycarousel li').click(function() {
		       				     function playel(e) {
							 
							 var percent = $(e).position().top / $(window).height();
							 
							 // set margin-left on ul to achieve a 'scroll' effect
							 $('.mycarousel').scrollTop(percent * ($(window).height() + 315));


							 var eready = $.data(e, 'ready');
		       					 window.pop && window.pop.destroy();
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
							 sendhash({lastWatched: id});
		       					 $('#video').html('');
		       					 window.pop = Popcorn.smart("#video", $(e).attr('url'));
							 
		       					 pop.media.addEventListener("ended", function() {
		       									playel($(e).next()[0]);
		       								    });
		       					 setTimeout(function(){
									pop.play();
								    }, 2000);
		       				     }

		       				     playel(this);
		        			 });

		       var hashnow = parsehash();
		       if (hashnow.lastWatched) {
			   $('#li-' + hashnow.lastWatched).click();
		       }
		       else {
			   $($('.mycarousel li')[0]).click();   
		       }
		   });
}