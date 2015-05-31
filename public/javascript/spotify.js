
var spotify = {
	client_id : '*************************', // <- Enter the Client ID
	callback_url : "http://YOUR_DOMAIN/spotify/callback", // <- Enter the Redirect URI
	access_token : null,

	addPlaylist: function () {
		var _this = this;
		_this.spotifyLogin(function() {
			showLoading();
			loadingMsg("Importing playlist to Spotify.")
			$("#playlist-row").hide();
			_this.getUserId(function (userId) {
				_this.createUserPlaylist(userId, function (userId, playlistId) {
					_this.searchTracks(function (tracks) {
						_this.addTracks(userId, playlistId, tracks, function () {
	        				hideLoading();
	        				$("#playlist-row").show();
	        				window.open('https://play.spotify.com/user/' + userId + '/playlist/' + playlistId,"_self")
	        			})
	        		})
	        	})
	        });
	    });
	},

	spotifyLogin: function (callback) {
	var _this = this;
		if (this.access_token == null) {
			var url = 'https://accounts.spotify.com/authorize?' +
				'client_id=' + spotify.client_id +
				'&redirect_uri=' + encodeURIComponent(spotify.callback_url) +
				'&response_type=token' +
				'&scope=playlist-modify-public';


			window.addEventListener("message", function(event) {
				var data = JSON.parse(event.data);
				_this.access_token = data.access_token;
				callback();
			}, false);

			window.open(url, 'spotify login', 'width=500, height=500');
		} else {
			callback();
		}
	},

	getUserId: function (callback) {
	    $.ajax({
	    	url : 'https://api.spotify.com/v1/me',
			method : "GET",
			headers : {
				'Authorization' : 'Bearer ' + this.access_token
			}
		}).then(function(data) {
			callback(data.id)
		});
	},

	createUserPlaylist: function (userId, callback) {

		$.ajax({
			url: 'https://api.spotify.com/v1/users/'+userId+'/playlists',
			method: "POST",
			data: JSON.stringify({
				name: "Moosic.me: " + user.getTracks().join(", ")
			}),
			dataType:'json',
			headers: {
				'Authorization' : 'Bearer ' + this.access_token,
				'Content-Type': 'application/json',
			}
		}).then(function(data) {
			callback(userId, data.id)
		});

	},

	addTracks: function (userId, playlistId, track_ids, callback) {

		var pltracks = new Array();

		for (var i=0; i<track_ids.length; i+=100) {

			pltracks.push($.ajax({
				url: 'https://api.spotify.com/v1/users/'+userId+'/playlists/'+playlistId+'/tracks',
				method: "POST",
				data: JSON.stringify({
					uris: track_ids.slice(i, i+99)
				}),
				dataType:'json',
				headers: {
					'Authorization' : 'Bearer ' + this.access_token,
					'Content-Type': 'application/json',
				}
			}));

		}

		$.when.apply($, pltracks).done(function() {
			callback();
		});

	},

	searchTracks: function (callback) {
		var calls = new Array();

		var pl = getPlaylist().getTracks()
		var tracks = new Array();
		var tracksSearch = 0;

		for (x in pl) {
			$.ajax({
		    	url : 'https://api.spotify.com/v1/search',
				method : "GET",
				async: false,
				headers : {
					'Authorization' : 'Bearer ' + this.access_token
				},
				data: {
					type : "track",
					q : x,
					limit: 1
				}
			}).done(function( data ) {
				if (typeof data.tracks.items[0] != "undefined") {
					tracks.push(data.tracks.items[0].uri)
				}
				tracksSearch += 1;
			}).fail(function( jqXHR, textStatus ) {
				hideLoading();
				$("#playlist-row").show();
				alert("An unexpected error has occurred. Message:" + textStatus);
			});

		}

		var si = setInterval(function () {
			if (tracksSearch == getPlaylist().getNumber()) {
				clearInterval(si);
				callback(tracks);
			}
		}, 1000);
	}

}
