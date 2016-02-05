function check_only_one_time(argv, options) {
    return ['h', 'm', 's']
        .map(k => options[k])
        .filter(k => k)
        .length <= 1;
}

module.exports = require('yargs')
    .usage('Usage: $0 [-r | -recursive] path [...] [-d | -dest destination] [-s | -schedule crontab_string]')
    .demand(1)
    .boolean(['r', 'w'])
    .nargs('d', 2)
    .alias('r', 'recursive')
    .alias('d', 'dest')
    .alias('s', 'schedule')
    .boolean('D')
    .alias('D', 'debug')
    .check(check_only_one_time)
    .argv;
