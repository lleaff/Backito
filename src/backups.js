var scp = require('scp');
var svn = require('svn-spawn');

function parse_ssh(str, callback)
{
	var res = str.split("@");
	var ret = [];
	var ret =[]; 
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
	ssh_back: function(dest, args, v)
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
	svn_back: function(dest, args, v)
	{
		console.log("backup to svn :", dest);
		if (v == 2)
		{
			var client = new svn({
			    cwd: dest,
			    username: 'amira_s',
			    // password: 'fdkjhfdskj'
			});
			client.cmd(['add', '-q', args[0]], function(err, data) {
			    console.log('subcommand done');
			    console.log(err);
			    console.log(data);
			});
			!function svnSendArg(i) {
				client.add(args[i], function(i, err, data) {
				    if (err == null) 
					{    
					    client.commit(['making some changes on ' + args[i], args[i]], function(i, err, data) {
					        console.log('committed ', args[i]);
					    }.bind(null, i));
			    	}
			    	else
			    		console.log("Something went wrong with ", args[i]);
					if (args.length > i + 1) 
						svnSendArg(i  + 1);
				}.bind(null, i));
			}(0);
		}			
	},
	lcl_back: function(dest, args, v)
	{
		console.log("local backup to :", dest);
		console.log(args);
	}

}
