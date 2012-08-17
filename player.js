playlist = new Meteor.Collection("playlist");

if (Meteor.is_client) {
    Template.foo.list = function () {
	return  [
	    {
		id: 'xxx',
		url: 'http://soundcloud.com/anticon/why-sod-in-the-seed'},
	    {
		id: '2VRd6yALNpU',
		url: 'http://www.youtube.com/watch?v=2VRd6yALNpU'},
	    {
		id: '30861381',
		url: 'http://vimeo.com/30861381'}
	];
    };

    Meteor.startup(function () {


		       $('.jcarousel').jcarousel({
		       				     // Configuration goes here
		       				 });


		       $('.jcarousel li').click(function() {
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