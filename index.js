#!/usr/bin/env node --harmony-destructuring

var { compose, curry } = require('ramda');

var argv = require('yargs')
    .boolean(['r'])
    .alias('r', 'recursive')
    .alias('d', 'dest')
    .argv;

console.log("process.argv", process.argv);
console.log("yargs.argv", argv);
