
var playlist;

$(document).ready(function () {

	$("#number").on('change keydown keypress keyup', function () {
		if ($.trim($("#number").val()) != "") {
			$("#duration").prop( "disabled", true );
		} else {
			$("#duration").prop( "disabled", false );
		}
	});

	$("#duration").on('change keydown keypress keyup', function () {
		if ($.trim($("#duration").val()) != "") {
				$("#number").prop( "disabled", true );
		} else {
			$("#number").prop( "disabled", false );
		}
	});

	$("#track-inputs").on('click', '.add-track', function (e) {
		e.preventDefault();

		input.addTrack(this);
	})

	$("#track-inputs").on('click', '.remove-track', function (e) {
		e.preventDefault();
		input.removeTrack(this);
	})

	$("#new-playlist").click(function () {
		createNewPlaylist();
	})

	$("#add-spotify").click(function () {
		spotify.addPlaylist();
	})

	$("#create-form").submit(function (e) {
		e.preventDefault();

		clearWarnings(); // clear error messages from the form

		if (validate()) { // check the form's data
			clearData(); // clear previous playlist
			generatePlaylist();
			hideForm();
		}
	});

	$("#track-inputs").on('keyup', 'input[name="name"]', debounce(function () {
		$("#suggestions").text("")
		var title = $(this).val();
		var thisInput = $(this);
		if (title.trim() != "") {
			lastfm.searchTrack(title, function (titles) {
				for (var i=0; i<titles.length; i++) {
					$("#suggestions").append("<li>" + titles[i].name + " " +  titles[i].artist +"</li>");
				}
				$("#suggestions > li").bind("click", function () {
					thisInput.val($(this).text());
					$("#suggestions").text("");
					$("#suggestions > li").unbind('click');
				})
				$(document).bind("click", function(e) {
					if (e.target.id != "suggestions") {
						$("#suggestions").text("");
					}
				});

				var top = thisInput.outerHeight(true) + thisInput.position().top;
				$("#suggestions").css({"top": top + "px"})
			});
		}
	}, 500));

});

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
};

function generatePlaylist () {

	showLoading();
	loadingMsg("Searching for these tracks.")

	lastfm.searchTracks(user.getTracks(), function (name_artist) {

		lastfm.getTracksInfo(name_artist, function (tracks) {

			if (user.getDuration() != null && !checkMinDuration(tracks)) {
				return false;
			}

			loadingMsg("Searching for similar tracks.")
			lastfm.getSimilars(tracks, function (tracks) {

				loadingMsg("Generating playlist.")
				createPlaylist(tracks, function () {

					viewPlaylist();
					hideLoading();

				})
			})
		})
	})
}

function createPlaylist(tracks, callback) {

	if (user.getLessSimilar()) {
		for (var i=0; i<tracks.length; i++) {
			tracks[i].similar.reverse();
		}
	}

	playlist = new Playlist();

	var songsStop = (user.getNumber() != null) ? user.getNumber() : 50;

	var length = tracks.length;

	var div = parseInt(songsStop / length);

	var maxDuration = durationControl(tracks);

	var maxSongs = new Array();

	for (var j=0; j<length; j++) {
		maxSongs.push((j+1) * div)
	}

	for (var j=0; j<(songsStop-(div * length)); j++) {
		maxSongs[j] += 1;
		for (var k=j+1; k<length; k++) {
			maxSongs[k] += 1;
		}
	}

	for(var i=0;i<tracks.length;i++) {

		var t = tracks[i];

		playlist.add({
			name: t.name,
			artist: t.artist,
			duration: t.duration,
			cover: (t.cover != null) ? t.cover : "/images/nocover.png"
		})

		for(var j=0;j<t.similar.length;j++) {

			var ts = t.similar[j];

			if(user.getDuration() != null  && (maxDuration[i] == j || maxDuration[i] == null)) {
				break;
			}

			if (user.getDuration() == null && playlist.getNumber() >= maxSongs[i]) {
				break;
			}

			playlist.add({
				name: ts.name,
				artist: ts.artist,
				duration: ts.duration,
				cover: (ts.cover != null) ? ts.cover : "/images/nocover.png"
			})

		}

	}

	callback();
}


function durationControl(tracks) {

	if(user.getDuration() != null) {
		var similar_length = 0;

		var r = new Array();

		for (var i=0; i<tracks.length; i++) {
			if (tracks[i].similar.length > similar_length) {
				similar_length = tracks[i].similar.length;
			}
			r[i] = null;
		}

		var totalDuration = 0;
		var check = new Object();

		for (var j=0; j<tracks.length; j++) {

			var t = tracks[j];
			var key = t.name + " - " + t.artist;

			if (!check.hasOwnProperty(key)) {
				check[key] = true;
				totalDuration += t.duration;
			}

		}

		for (var i=0; i<similar_length; i++) {

			for (var j=0; j<tracks.length; j++) {

				if (typeof tracks[j].similar[i] != "undefined") {

					var t = tracks[j].similar[i];
					var key = t.name + " - " + t.artist;

					if (!check.hasOwnProperty(key)) {
						check[key] = true;

						totalDuration += t.duration;
						r[j] = i;

						if (totalDuration > user.getDuration()) {
							return r
						}
					}
				}

			}
		}
	} else {
		return null
	}
}

function viewPlaylist() {

	var p = playlist.getTracks();

	for (song in p) {

		var duration = '<span class="duration-span">' + getMinSec(p[song].duration) + '</span>';

		var img = "<img src='" + p[song].cover + "' onerror='imageError(this);'>";

		$("#playlist-ul").append('<li class="list-group-item">' + img + " " + song + " " + duration + '</li>')

	}

	$("#number-of-tracks").html(playlist.getNumber() + " tracks");
	$("#total-duration").html(playlistDuration(playlist.getDuration()));

	showPlaylist();
}

function checkMinDuration(tracks) {
	var totalDuration = 0;
	var forcheck = new Object();

	for (var i=0; i<tracks.length; i++) {

		var t = tracks[i];
		var key = t.name + " - " + t.artist;

		if (!forcheck.hasOwnProperty(key)) {
			forcheck[key] = true;
			totalDuration += t.duration;
		}

	}

	if (totalDuration > user.getDuration()) {
		showForm();
		hideLoading()

		var content = "Minimum duration is " + Math.ceil(totalDuration / 1000 / 60) + " minutes.";
		var elem = $("#duration");

		input.warning(elem, content);

		return false;
	}
	return true;
}


function validate() {
	clearWarnings();

	var ok = true;

	$('input[name="name"]').each(function (index,element) {

		if ($.trim($(this).val()) == "") {
			var popcontent;

			if (index == 0) {
				popcontent = "Please enter a track."
			} else {
				popcontent = "Please enter a track or delete this field."
			}

			input.warning($(this), popcontent);

			ok = false;
		}
	});

	if(!ok) {
		return false;
	}

	var number = $.trim($("#number").val());

	if ((number != "" && isNaN(number)) || parseInt(number) < user.getTracks().length || parseInt(number) > 250) {

		var popcontent;
		if (number != "" && isNaN(number)) {
			popcontent = "Please give a number or leave empty.";
		} else if (number < user.getTracks().length){
			popcontent = "Minimum number of tracks is " + user.getTracks().length + ".";
		} else {
			popcontent = "Maximum number of tracks is 250";
		}

		input.warning($("#number"), popcontent);

		ok = false;
	}

	var duration = $.trim($("#duration").val());

	if (duration != "" && isNaN(duration)) {

		input.warning($("#duration"), "Please give a number or leave empty.");

		ok = false;
	}

	return ok;
}


function clearWarnings() {
	$("#track-inputs > input").css("border", "0px");
	$("#number").css("border", "0px");
	$("#duration").css("border", "0px");
}


function clearData() {
	playlist = new Object();
	$("#playlist-ul").empty();
}

function getMinSec(t) {
	var sec = (t / 1000) % 60;
	var min = Math.floor(t / 1000 / 60);

	return min + ":" + ((sec < 10) ? "0" : "") + sec;
}

function imageError(image) {
    image.onerror = "";
    image.src = "/images/nocover.png";
    return true;
}

function playlistDuration(t) {
	var sec = (t / 1000) % 60;
	var min = (Math.floor(t / 1000 / 60)) % 60;
	var hrs = Math.floor(t / 1000 / 60 / 60);

	if (hrs > 0 ) {
		return hrs + ((hrs == 1) ? " hour " : " hours ") + " "
				+ ((min < 10) ? "0" : "") + min + ((min == 1) ? " minute " : " minutes ")
	} else {
		return ((min < 10) ? "0" : "") + min + ((min == 1) ? " minute " : " minutes ")
				+ ((sec < 10) ? "0" : "") + sec + ((sec == 1) ? " second " : " seconds ");
	}
}

function createNewPlaylist() {
	showForm();
	$("input[name=name]").val("");
	$("#number").prop( "disabled", false );
	$("#number").val("");
	$("#duration").prop( "disabled", false );
	$("#duration").val("");
	clearData();
}


function showLoading() {
	$("#loading").show();
}

function hideLoading() {
	$("#loading").hide();
	$("#loading-msg").text("")
}

function getPlaylist() {
	return playlist;
}

function loadingMsg(msg) {
	$("#loading-msg").text(msg)
}

function trackError(x, msg) {
	showForm();

	input.warning($('input:eq(' + x + ')', "#track-inputs"), msg);

	hideLoading();
	return false;
}

function showForm() {
	$("#create-form").show();
	$("#playlist-row").hide();
}

function hideForm() {
	$("#create-form").hide();
}

function showPlaylist() {
	$("#create-form").hide();
	$("#playlist-row").show();
}

var input = {

	warning : function (elem, content) {
		elem.css("border", "3px solid #ec5a6d");
		elem.popover({
			content: content,
			placement: "bottom"
		})
		elem.popover('show')
			.on('hidden.bs.popover', function () {
				$(this).popover('destroy')
			});
	},

	addTrack : function (elem) {
		$(elem).parent().after('<input type="text" name="name" placeholder="Enter another track" autocomplete="off"><span class="btn-in-input"><button type="button" class="add-track" title="Add track">+</button><button type="button" class="remove-track" title="Remove this track">&times;</button></span>');
	},

	removeTrack : function (elem) {
		$(elem).parent().prev("input[name=name]").popover('destroy')
		$(elem).parent().prev("input[name=name]").remove();
		$(elem).parent().remove();
		$('.popover').popover('show');
	}

}

var user = {

	getNumber : function () {
		return ($.trim($("#number").val()) != "") ? parseInt($("#number").val()) : null
	},

	getDuration : function () {
		return ($.trim($("#duration").val()) != "") ? parseInt($("#duration").val()) * 60 * 1000 : null
	},

	getTracks : function() {
		var userTracks = $('input[name="name"]');

		var titles = new Array();

		userTracks.each(function () {
			titles.push($(this).val());
		});

		return titles;
	},

	getLessSimilar: function() {
		return $("#dissimilar").prop("checked");
	}

}
