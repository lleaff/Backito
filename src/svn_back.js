var spawn = require('child_process').spawn;
var cfg = require('./config');
var utils = require('./utils');
var svn = require('svn-spawn');

function svnRepoUrlToHash(url) {
    return utils.hash(url);
}  

function svn_co (dest, callback)
{
	var svnco = spawn('svn', ['-q', 'co', dest, cfg.svnStorage + '/' + svnRepoUrlToHash(dest)], {stdio: 'inherit'});
	svnco.on('exit', function(code, mes) 
	    {
	        if (code === 0)
	         {
	         	callback(0);
	         }
	         else
	         	console.log("Something went wrong!");
	         	callback(1);
	    });
};

module.exports = {
	svn_back: function(dest, args, v, callback)
	{
		console.log("backup to working copy :", dest);
		if (v == 2)
		{
			svn_co(dest, function(code)
			{
				if (code == 0)
				{
					var client = new svn({
					    cwd: cfg.svnStorage + '/' + svnRepoUrlToHash(dest),
					    silent: true
					});
					!function svnSendArg(i) {
						client.add(args[i], function(i, err, data) {
							if ((err == null) || (err.toString().match(/is already under version control/))) 
							{    
							    client.commit(['updated ' + args[i], args[i]], function(i, err, data) {
							        console.log(args[i], "has been committed");
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
									        console.log(args[i], "has been committed");
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
			});
		}			
	}
};
