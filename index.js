#!/usr/bin/env node

var argv = require('yargs')
    .boolean(['r'])
    .alias('r', 'recursive')
    .alias('d', 'dest')
    .argv;

console.log("process.argv", process.argv);
console.log("yargs.argv", argv);
