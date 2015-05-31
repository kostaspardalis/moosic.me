
var Playlist = function () {
	this._tracks = new Object();
	this._number = 0; // total number of songs
	this._duration = 0; // total duration in ms
};

Playlist.prototype = {
	add : function (track) {
		/* 
		 * track : {
		 * 	 name: String,
		 * 	 artist: String,
		 * 	 duration: Number,
		 * 	 cover: String
		 * }
		 */
		if (!(this._tracks.hasOwnProperty(track.name + " - " + track.artist))) {
			this._tracks[track.name + " - " + track.artist] = {
				duration: track.duration,
				cover: (track.cover) ? track.cover : "/images/nocover.png"				
			};
			this._number += 1;
			this._duration += parseInt(track.duration);
		}
	},
	
	remove : function (track) {
		/*
		 * track : {
		 * 	 name: String,
		 * 	 artist: String
		 * }
		 */
		if (this._tracks.hasOwnProperty(track.name + " - " + track.artist)) {
			this._number -= 1;
			this._duration -= parseInt(this._tracks[track.name + " - " + track.artist].duration);
			delete this._tracks[track.name + " - " + track.artist];
		}
	},
	
	getTracks : function () {
		return this._tracks;
	},
	
	getNumber : function () {
		return this._number;
	},
	
	getDuration : function () {
		return this._duration;
	},
		
	clear : function () {
		this._tracks = new Object();
	}
};