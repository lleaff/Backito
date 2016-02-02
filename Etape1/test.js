#!/usr/bin/env node

var ncp = require("ncp");
var fs = require('fs-extra');
var myArgs = process.argv.slice(2);
var myArgs = process.argv.slice(2)[0];
var time = process.argv.slice(2)[1] * 60 * 60 * 1000;

setInterval(function(){fs.copy(myArgs, '/Users/delor_r/Desktop/Backup')},time);