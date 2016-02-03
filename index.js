#!/usr/bin/env node

const fs = require('fs');
var cfg = require('./src/config');
var utils = require('./src/utils');

var argv = require('yargs')
    .usage('Usage: $0 [-r | -recursive] path [...] [-d | -dest destination] [-s | -schedule crontab_string]')
    .demand(1)
    .boolean(['r'])
    .boolean(['w'])
    .nargs('d', 2)
    .alias('r', 'recursive')
    .alias('d', 'dest')
    .alias('s', 'schedule')
    .argv;

var back = require('./src/backups.js');

function check_info(path, callback)
{
	console.log("destination ommited, looking for config file");
	var  config = require(path);
	if (Object.keys(config).length > 0)
	{
		var dest = config.destinations;
		callback (dest);
	}
	else
	{
		console.log("Config file doesn't exist.");
		callback (null);
	}	
}


function backs(type, dest, args, v)
{
	switch (type) {
	  case "ftp":
	  	back.ftp_back(dest, args);
	    break;
	  case "ssh":
		back.ssh_back(dest, args, 2);
	    break;
	  case "git":
	  	back.git_back(dest, args);
	    break;
	  case "svn":
	  	back.svn_back(dest, args);
	    break;
	  case "lcl":
	  	back.lcl_back(dest, args);
	    break;
	  default:
	    console.log("Unrecognized type of backup destination.");
	}
}

function backup(path, v, args)
{
	if (v == 1)
	{
		console.log("starting backup from config_default");
		
	}
	else if (v == 2)
	{
		console.log("starting backup from -d arguments");
		for (var i = 0; i < path.length; i++) {
			if (i % 2 == 0)
				backs(path[i], path[i + 1], args, 2);
		};	
	}
}

function check_dest(path)
{
	if (path.match(/^git@.+|.+[.]git$/))
		return ("git");
	else if (path.match(/^ftp:\/\/.+/))
		return ("ftp");
	else if (path.match(/^ssh:\/\//))
		return ("ssh");
	else if (path.match(/^http.+/))
		return ("svn");
}

utils.map(argv._, function(path, callback){
	fs.stat(path, function(err, stat) {
	    if(err == null) {
	    	if (stat.isDirectory(path) && !argv.r)
			{	
				console.log(path, "is a directory.[not copied because of missing option r]");
				return ;		
			}
			else if (stat.isFile(path) || (stat.isDirectory(path) && argv.r))
				callback(path);
	    }
	    else
	    {
	    	console.log(path, "doesn't exist.");
	    	return ;
	    }
	});	
}, function(stats){
	if (!argv.d)
	{
		check_info('./resources/config_default.json', function(dest)
		{
			if (dest == null)
			{	
				console.log("An error occured !");
				console.log("Please state the destination with -d or restart backito with w option to configure your config file.");
			}
			else
				backup(dest, 1, argv._);
		});
	}
	else 
	{
		backup(argv.d, 2, argv._);
	}
});
