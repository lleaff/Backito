var spawn = require('child_process').spawn;
var cfg = require('./config');
var utils = require('./utils');

function gitRepoUrlToHash(url) {
    return utils.hash(url);
}  

function git_co (dest, callback)
{
	var gitco = spawn('git', ['-q','clone', dest, cfg.svnStorage + '/' + gitRepoUrlToHash(dest)], {stdio: 'inherit'});
	gitco.on('exit', function(code, mes) 
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
	git_back: function(dest, args, v, callback)
	{
		console.log("back up  to git repo: ", dest);
		if (v == 2)
		{
			git_co(dest, function(code)
			{
				if (code == 0)
				{
					var simpleGit = require('simple-git')(cfg.svnStorage + '/' + gitRepoUrlToHash(dest));
					!function gitSendArg(i) {
			    		var cp = spawn('cp', ['-r', args[i], cfg.svnStorage + '/' + gitRepoUrlToHash(dest)]);
					    cp.on('exit', function(i, code) 
					    {
					        if (code === 0)
							{
								simpleGit.add(args);
								simpleGit.commit('updated ' + args[i], args[i]],
								function(i, err, data) {
								    console.log(args[i], "has been committed");
									if (args.length > i + 1) 
										svnSendArg(i  + 1);
									else
										callback();
								}.bind(null, i));
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