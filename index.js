#!/usr/bin/env node --harmony-destructuring

const fs = require('fs');
var { compose, curry } = require('ramda');
var utils = require('./src/utils/utils.js');

var argv = require('yargs')
    .usage('Usage: $0 [-r | -recursive] path [...] [-d | -dest destination] [-s | -schedule crontab_string]')
    .boolean(['r'])
    .alias('r', 'recursive')
    .alias('d', 'dest')
    .alias('s', 'schedule')
    .argv;

console.log("yargs.argv", argv, "\n");
utils.map(argv._, function(path){
	fs.stat(path, function(err, stat) {
	    if(err == null) {
	        console.log('File exists');
	    	if (stat.isDirectory(path))
				console.log(path, "is a directory.");
			else if (stat.isFile(path))
				console.log(path, "is a file.");
			return stat;
	    }
	    else
	    	return console.log(path, "doesn't exist.");
	});	
}, function(stats){
	console.log(stats);
});