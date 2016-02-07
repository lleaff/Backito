var scp = require('scp');
var spawn = require('child_process').spawn;
var utils = require('./utils');
var svn = require('./svn_back');
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
	svn_back : svn.svn_back,
	lcl_back: function(dest, args, v, callback)
	{
		console.log("local backup to :", dest);
        if (v !== 2) { return utils.debug('lcl_back: Need to implement preferences'); }

        var entry = new store();
        entry.store(args, function() {
            utils.forEach(args, function(arg) {
                entry.restore(arg, dest);
            }, function() {
                utils.debug('Added all paths');
                return callback.apply(this, arguments)});
        });
    }
}
