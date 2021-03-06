#!/usr/bin/env node

var fs    = require('fs');
var cfg   = require('./src/config');
var utils = require('./src/utils');
var back  = require('./src/backups.js');
var cron  = require('./src/timefunc.js');
var cargs  = require('./src/args');
var wizard = require('./src/wizard.js');
var forever = require('forever-monitor');


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

function get_config(args, v)
{
	data = require('./resources/config_default.json');
	
}

function backup(path, v, args)
{
	if (v == 1)
	{
		console.log("starting backup from config_default");
		get_config(args, v);		
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

function cron_backito()
{
	var time = [ 's', 'm', 'h'];
	var i = 0;
	Object.keys(cargs).map(
		function(k){
			if (time.indexOf(k) !== -1)
			{
				i += 1;
				cron['cron_' + k](cargs[k], backito);
			}
	});
	if (i == 0)
		backito();
}

function backito()
{
	utils.map(cargs._, function(path, callback){
		fs.stat(path, function(err, stat) {
		    if(err == null) {
		    	if (stat.isDirectory(path) && !cargs.r)
				{	
					console.log(path, "is a directory.[not copied because of missing option r]");
					return ;		
				}
				else if (stat.isFile(path) || (stat.isDirectory(path) && cargs.r))
					callback(path);
		    }
		    else
		    {
		    	console.log(path, "doesn't exist.");
		    	return ;
		    }
		});	
	}, function(stats){
		if (!cargs.d)
		{
			var dest = check_info('./resources/config_default.json');
			if (dest === null)
			{	
				console.log("An error occured !");
				console.log("Please state the destination with -d or restart backito with w option to configure your config file.");
			}
			else
				backup(dest, 1, cargs._);
		}
		else 
		{
			backup(cargs.d, 2, cargs._);
		}
	});
}

function startDaemon() {
  var daemon = new (forever.Monitor)(process.argv[1], {
    max: 3,
    silent: true,
    args: process.argv.slice(2)
  });
  daemon.start();
  daemon.on('exit', function() { console.log('Backito exited'); });
}

// =Execution
//------------------------------------------------------------

(function() {
  if (cargs.S)
    require('./site/server')(cargs.S);
  else if (cargs.h || cargs.m || cargs.s)
    startDaemon();
  else if (cargs.patch) {
    const store = require('./src/store');
    store.simpleRestore(cargs.patch[0], cargs.patch[1], cargs._[2],
                        function () {
                          console.log('Patching succeeded.');
                        }, function (err) {
                          console.log('Patching failed'+
                                      (err ? ': Error ['+err+']' : '.'));
                        });
  } else if (cargs.w)
    wizard.menu();
  else
    cron_backito();
})();
