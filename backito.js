#!/usr/bin/env node

var fs    = require('fs');
var cfg   = require('./src/config');
var utils = require('./src/utils');
var back  = require('./src/backups.js');
var cron  = require('./src/timefunc.js');
var argv  = require('./src/args');

function check_info(path)
{
	console.log("destination ommited, looking for config file");
	var  config = require(path);
	if (Object.keys(config).length > 0)
	{
		var dest = config.destinations;
		return (dest);
	}
	else
	{
		console.log("Config file doesn't exist.");
		return (null);
	}	
}

function backs(i, path, args, v, callback)
{
	var func = [ 'ftp', 'ssh', 'git', 'svn', 'lcl'];
	if (func.indexOf(path[i]) !== -1)
		back[path[i] + '_back'](path[i+1], args, v, callback);
	else
	    console.log("Unrecognized type of backup destination.");
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
		!function backs_loop(i) {	
			if (i % 2 == 0)
			{
				backs(i, path, args, 2, function(i){
					if (i + 1 < path.length)
						backs_loop(i + 1);
				}.bind(null, i));
			}
			else
			{
				if (i + 1 < path.length)
					backs_loop(i + 1);				
			}
		}(0);	
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

cron_backito();


function cron_backito()
{
	var time = [ 's', 'm', 'h'];
	var i = 0;
	Object.keys(argv).map(
		function(k){
			if (time.indexOf(k) !== -1)
			{
				i += 1;
				cron['cron_' + k](argv[k], backito);
			}
	});
	if (i == 0)
		backito();
}

function backito()
{
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
			var dest = check_info('./resources/config_default.json');
			if (dest === null)
			{	
				console.log("An error occured !");
				console.log("Please state the destination with -d or restart backito with w option to configure your config file.");
			}
			else
				backup(dest, 1, argv._);
		}
		else 
		{
			backup(argv.d, 2, argv._);
		}
	});
}
