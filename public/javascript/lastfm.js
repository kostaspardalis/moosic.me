
var lastfm = {
	api_key : '***************************', // <- Enter the Last.fm API key	
	
	// titles = ["title1", "title2", ... ]
	searchTracks: function (titles, callback) {
		var _this = this;
	
		var search = new Array();

		for(var i=0; i<titles.length; i++) {
			search.push($.getJSON("http://ws.audioscrobbler.com/2.0/", {
				method: 'track.search',
				track: titles[i],
				limit: 1,
				api_key: _this.api_key,
				format: 'json'
			}));
		}
	
		$.when.apply($, search).done(function() {
			var tracks = new Array();

			var length = (user.getTracks().length == 1) ? 1 : arguments.length;
			
			for (var i=0; i<length; i++) {
				
				var data = (!$.isArray(arguments[0])) ? arguments[0] : arguments[i][0]; 
				
				if (!data.results.trackmatches.track) {
					return trackError(i, "This track not found.");
				} else {
					tracks.push({
						name: data.results.trackmatches.track.name,
						artist: data.results.trackmatches.track.artist
				    	});
				}
			}	

			// callback([{track: 'title1", artist: 'name1'}, { ... }, ...])
			callback(tracks)
			
		});
	},
	
	// tracks = [{track: 'title1", artist: 'name1'}, { ... }, ...]
	getTracksInfo: function (tracks, callback) {
		
		var _this = this;
		
		var getInfo = new Array();
		
		for (var i=0; i<tracks.length; i++) {
			getInfo.push($.getJSON("http://ws.audioscrobbler.com/2.0/", {
				method: 'track.getInfo',
				track: tracks[i].name,
				artist: tracks[i].artist,
				api_key: _this.api_key,
				format: 'json'
			}));
		}	
		
		$.when.apply($, getInfo).done(function() {
			var info = new Array();
			
			var length = (user.getTracks().length == 1) ? 1 : arguments.length;
			
			for (var i=0;i<length;i++) {
				
				var t = (!$.isArray(arguments[0])) ? arguments[0].track : arguments[i][0].track; 
				
				info.push({
					name : t.name,
					artist : t.artist.name,
					duration: parseInt(t.duration),
					cover: (t.album && t.album.image) ? t.album.image[1]["#text"] : null
				});
			}
			
			// callback([{trackInfo1}, {trackInfo2}, ... ])
			callback(info)
		});
	
	},
	
	// tracks = [{trackInfo1}, {trackInfo2}, ... ]
	getSimilars: function (tracks, callback) {
		
		var _this = this;
		
		var getSimilar = new Array();
		
		for (var i=0; i<tracks.length; i++) {
			
			var t = tracks[i];
			
			getSimilar.push($.getJSON("http://ws.audioscrobbler.com/2.0/", {
				method : 'track.getsimilar',
				track : t.name,
				limit: 249,
				artist : t.artist,
				api_key : _this.api_key,
				format : 'json'
			}));
		}
	
		$.when.apply($, getSimilar).done(function() {
			
			var length = (user.getTracks().length == 1) ? 1 : arguments.length;
			
			for (var i=0; i<length; i++) {
				
				tracks[i].similar = new Array();
				
				var data = (!$.isArray(arguments[0])) ? arguments[0] : arguments[i][0];
				
				if ($.isArray(data.similartracks.track)) {
					
					var t = data.similartracks.track;
					
					for (var j=0; j<t.length; j++) {
						tracks[i].similar.push({
							name: t[j].name,
							artist: t[j].artist.name,
							duration: parseInt(t[j].duration),
							cover: (t[j].image && t[j].image[1]['#text']) ? t[j].image[1]['#text'] : null
						});
					}
				} else {
					return trackError(i, "This track doesn't have similar tracks.");
				}
		
			}
			
			// callback(tracks, [{similarTracks1}, {similarTracks2}, ... ])
			callback(tracks);
		});
	}
}
