# Moosic.me: Spotify Playlist Generator based on Last.fm similar tracks

http://www.moosic.me/

Moosic.me is a web application created for the course of Speech Processing in Department of Informatics of Ionian University, Corfu, Greece. This web application accepts as input a list of tracks by the user and generates a playlist with similar tracks, according to Last.fm. Then the generated playlist can be added to the user's Spotify account with one click. 

## Technologies and tools

This web application integrates the following technologies and tools:

* HTML5
* CSS3
* JavaScript
* JQuery
* Bootstrap
* Node.js
* Last.fm API
* Spotify Web API


## Building the code

1. Install [Node.js](https://nodejs.org/)

2. Install [npm](http://blog.npmjs.org/post/85484771375/how-to-install-npm)

3. Download or clone the code:

  ```
  git clone https://github.com/kostaspardalis/moosic.me.git
  ```
  
4. Use `npm` to install all dependencies for this app:

  ```
  cd ./moosic.me
  npm install
  ```

5. Get an API key from [Last.fm](http://www.last.fm/api/account/create). Then copy and paste it in the `./moosic.me/public/javascript/lastfm.js` file. (See the comments in the file).
6. Create a new apllication on [Spotify](https://developer.spotify.com/my-applications/#!/). If you're running the app in localhost set `http://127.0.0.1:3000/spotify/callback` as `Redirect URI`. Next copy the `Client ID` and `Redirect URI` and paste in the the `./moosic.me/public/javascript/spotify.js` file. (See the comments in the file).

7. Run the app:

  ```
  nodejs app.js
  ```

8. Open the app in your browser using the address `http://127.0.0.1:3000`.
