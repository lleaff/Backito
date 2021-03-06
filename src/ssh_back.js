var scp = require('scp');
var spawn = require('child_process').spawn;
var utils = require('./utils');
const ErrorUserInput = utils.errors.userInput;


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
	ssh_back : function(dest, args, v, callback)
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
	}
}