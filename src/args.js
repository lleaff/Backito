function check_only_one_time(argv, options) {
    if(['h', 'm', 's']
        .map(k => argv[k])
        .filter(k => k)
        .length > 1)
        throw new Error('You can only use one unit at a time.');
    else
        return true;
}

const USAGE = 'Usage: $0 [-r | -recursive] path [...] [-d | -dest destination] [-s | -schedule crontab_string]';

module.exports = require('yargs')
    .usage(USAGE)
    .demand(1)
    .nargs('s', 1)
    .nargs('m', 1)
    .nargs('h', 1)
    .boolean(['r', 'w'])
    .boolean('R')
    .alias('R', 'restore')
    .alias('p', ['previous', 'revision', 'rev'])
    .implies('p', 'R')
    .nargs('d', 2)
    .alias('r', 'recursive')
    .alias('d', 'dest')
    .alias('s', 'seconds')
    .alias('m', 'minutes')
    .alias('h', 'hours')
    .boolean('D')
    .alias('D', 'debug')
    .check(check_only_one_time)
    .argv;
