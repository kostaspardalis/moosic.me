var forever = require('forever-monitor');

var child = new(forever.Monitor)('app.js', {
	max: 10,
    silent: true,
    args: []
});

child.on('exit', function() {
    console.log('app.js has exited after 3 restarts');
});

child.start();