# Backito

####Back up everything.

* Schedule backups to local targets, SSH servers, or SVN or GIT repos.
* Restore files to earlier saved versions using a local differential history that is built upon everytime Backito is called.

####Technologies

Node.js was chosen for its focus on asynchronicity.  
File patching is done using [JojoDiff](http://jojodiff.sourceforge.net/) with a custom Node.js [wrapper](https://github.com/lleaff/jdiff-node). 
