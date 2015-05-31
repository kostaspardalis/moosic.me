

module.exports = function(app) {
	
	app.get('/', function(req, res) {
		res.render('index.ejs');
	});
	
	app.get('/spotify/callback', function(req,res) {
		res.render('spotify-callback.ejs');
	});
	
};
