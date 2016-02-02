#!/usr/bin/env node

var argv = require('yargs').argv;

console.log("process.argv", process.argv);
console.log("yargs.argv", argv);

console.log("-m", argv.m);
