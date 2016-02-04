var spawn = require('child_process').spawn;
var strdir = require('./config').storageDir;
var utils = require('./utils');

function svn_co (dest)
	{
		var svnco = spawn('svn', ['co',  dest, strdir + '/' + utils.hash(strdir)]);
		svnco.stderr.on('data', function(err){
			var stringdec = new (require('string_decoder').StringDecoder)('utf-8');
			console.log(stringdec.write(err));
		});
		svnco.stdin.pipe(process.stdin);
		svnco.on('exit', function(code, mes) 
		    {
		        if (code === 0)
		         {
		         	return (0);
		         }
		         else
		         	console.log("Something went wrong!");
		         	return (1);
		    });
	};

module.exports = {
	svn_back: function(dest, args, v, callback)
	{
		console.log("backup to working copy :", dest);
		if (v == 2)
		{
			if (svn_co(dest) == 0)
			{	
				var client = new svn({
				    cwd: strdir,
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
		}			
	}
};