var scp = require('scp');
var spawn = require('child_process').spawn;
var utils = require('./utils');
const ErrorUserInput = utils.errors.userInput;
var svn = require('./svn_back');
var git = require('./git_back');
var ssh = require('./ssh_back');
var store = require('./store');
const cargs = require('./args');

module.exports = {
	ftp_back: function(dest, args, v, callback)
	{
		return console.log("Not fully implemented yet.");
	},
	ssh_back: ssh.ssh_back,
	git_back: git.git_back,
	svn_back : svn.svn_back,
	lcl_back: function(dest, args, v, callback)
	{
        const rev = cargs.revision || undefined;
        console.log('arg{', args, '}');
		console.log("local backup to :", dest);
        if (v !== 2) { return utils.debug('lcl_back: Need to implement preferences'); }
        var entry = new store();

        function restoreCallback() {
            utils.debug('Added all paths');
            return callback.apply(this, arguments);
        }
        function storeCallback() {
            utils.debug('Storage finished, restoring...');
            entry.restore(args, dest, restoreCallback);
        }
        if (cargs.restore) {
            entry.restore(args, dest, rev, restoreCallback);
        } else {
            entry.store(args, storeCallback, function() {
                utils.error('Backup failed');
            });
        }
    }
}
