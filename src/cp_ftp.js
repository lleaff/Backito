#!/usr/bin/env node

var fs    = require('fs');
var cfg   = require('./src/config');
var utils = require('./src/utils');
var back  = require('./src/backups.js');
var ftp = require('ftp');

 var c = new Client();
	c.on('ready', function() {
	c.get('foo.txt', function(err, stream) {
		if (err) throw err;
		stream.once('close', function() { c.end(); });
		stream.pipe(fs.createWriteStream('foo.local-copy.txt'));
	});
});
c.connect();

function ftp_cp_r(path, dest)
{
	var files = fs.readdirSync(path);	 
	utils.map(files, function(filename, callback){
		if (fs.isDirectory(filename)
		{	
			fs.mkdirSync(path.join(dest, filename));
			cp_r(filename);
		}
		else
		{
			cp(filename, dest);
		}
	});
}