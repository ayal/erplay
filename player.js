playlist = new Meteor.Collection("playlist");

if (Meteor.is_client) {
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
    window.getthumb = function(){

	if (this.player === 'youtube_player') {
	    return "http://img.youtube.com/vi/" + this.id + "/0.jpg";
	}
	else if (this.player === 'vimeo') {
	    var that = this;
	    $.getJSON('http://www.vimeo.com/api/v2/video/' + this.id + '.json?callback=?', {format: "json"}, function(data) {
			  $('#img-' + that.id).attr('src', data[0].thumbnail_large);
		      });
	    return '';
	}
	else if (this.player === 'soundcloud') {
	    var that = this;
	    $.get('http://api.soundcloud.com/tracks/' + that.id +  '.json?client_id=YOUR_CLIENT_ID', {format: "json"}, function(data) {
		      $('#img-' + that.id).attr('src', data.artwork_url);
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
	var parsed = $.map(hashnow.playlist, function(x){
			       x = JSON.parse(x);
			       x['image'] = getthumb;
			       x['url'] = geturl;
			       return x;
			   });
	return parsed;
    };

    Meteor.startup(function () {


		       // $('.jcarousel').jcarousel({
		       // 				     // Configuration goes here
		       // 				 });


		       $('.mycarousel li').click(function() {
		       				     function playel(e) {
		       					 window.pop && window.pop.destroy();
		       					 $('#video').html('');
		       					 window.pop = Popcorn.smart("#video", $(e).attr('url'));
							 
		       					 pop.media.addEventListener("ended", function() {
		       									playel($(e).next()[0]);
		       								    });
		       					 pop.play();
		       				     }
		       				     playel(this);
		        			 });
		   });
}