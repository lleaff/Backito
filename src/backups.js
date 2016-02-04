var scp = require('scp');
var svn = require('svn-spawn');
var spawn = require('child_process').spawn;
var utils = require('./utils');

var store = require('./store');

function parse_ssh(str, callback)
{
	var res = str.split("@");
	var ret = [];
	ret["user"] = res[0];
	var tmp = res[1].split(":");
	ret["host"] = tmp[0];
	ret["path"] = tmp[tmp.length - 1];
	callback(ret);
}

module.exports = {
	ftp_back: function(dest, args, v)
	{
		console.log("backup via ftp protocole to :", dest);
		console.log(args);
	},
	ssh_back: function(dest, args, v, callback)
	{
		console.log("backup via ssh protocole to :", dest);
		if (v == 2)
		{
			parse_ssh(dest, function(ret)
			{
				!function scpSendArg(i) {
					scp.send({
						  file: args[i], 
	  					  user: ret["user"],   
					  	  host: ret["host"],   
					  	  path: ret["path"],
					  	 bypassFingerprint: true          
			  			}, function (i, err) {
								if (err)
									console.log(err);
								else 
									console.log(args[i], ' transferred.');
								if (args.length > i + 1) 
									scpSendArg(i+1);
								else
									callback();
						}.bind(null, i));
				}(0);
				
			});
		}
		else
		{
			var option = {
				file: "",
				user: dest["user"],
				host: dest["host"],
				path: dest["path"],
				bypassFingerprint: true
			}
			!function scpSendArg(i) {
			option.file = args[i];
			client.scp(option, 
				function (i, err) {
					if (err)
						console.log(err);
					else 
						console.log(args[i], ' transferred.');
					if (args.length > i + 1) 
						scpSendArg(i+1);
				}.bind(null, i));
			}(0);

		}
	},
	git_back: function(dest, args, v)
	{
		console.log("backup to git :", dest);
		console.log(args);
	},
	svn_back: function(dest, args, v, callback)
	{
		console.log("backup to working copy :", dest);
		if (v == 2)
		{
			var client = new svn({
			    cwd: dest,
			    silent: true
			});
			!function svnSendArg(i) {
				client.add(args[i], function(i, err, data) {
					if ((err == null) || (err.toString().match(/is already under version control/))) 
					{    
					    client.commit(['updated ' + args[i], args[i]], function(i, err, data) {
					        console.log(args[i], "has been commited");
					   	if (args.length > i + 1) 
							svnSendArg(i  + 1);
						else
							callback();
					    }.bind(null, i));
			    	}
				    else if (err.toString().match(/is not a working copy/))
				    	console.log("You can't commit your files in ", dest, "because it is not a working copy.");
			    	else if (err.toString().match(/E200009/))
			    	{
			    		var cp = spawn('cp', ['-r', args[i], dest]);
					    cp.on('exit', function(code) 
					    {
					        if (code === 0)
					         {
					         	client.commit(['updated ' + args[i], args[i]], function(i, err, data) {
							        console.log(args[i], "has been commited");
							   	if (args.length > i + 1) 
									svnSendArg(i  + 1);
								else
									callback();
							    }.bind(null, i));
					         }   
					        else
					            console.log(err.toString());
					    });
			    	}
			    	else
			    	{
			    		console.log("Something went wrong with ", args[i]);
			    		console.log(err.toString());
			    	}
				}.bind(null, i));
			}(0);
		}			
	},
	lcl_back: function(dest, args, v, callback)
	{
		console.log("local backup to :", dest);
        if (v !== 2) return console.error('Not implemented yet');

        var entry = new store();
        entry.store(args, function() {
            utils.forEach(args, function(arg) {
                entry.restore(arg, dest);
            }, callback);
        });
    }
}
