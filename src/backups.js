var scp = require('scp');

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
		// else
		// {
		// 	for (var i = 0; i < args.length; i++) {
		// 		client.scp(args[i], {
		// 		    host: '',
		// 		    username: 'admin',
		// 		    password: 'password',
		// 		    path: '/home/admin/'
		// 		}, function(err) {})
		// 	};

		// }
	},
	git_back: function(dest, args, v)
	{
		console.log("backup to git :", dest);
		console.log(args);
	},
	svn_back: function(dest, args, v)
	{
		console.log("backup to svn :", dest);
		console.log(args);
	},
	lcl_back: function(dest, args, v)
	{
		console.log("local backup to :", dest);
		console.log(args);
	}

}