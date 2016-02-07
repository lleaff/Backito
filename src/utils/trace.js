var cargs = require('../args');

module.exports = function trace(expr, messageBegin, messageEnd) {
    if (!cargs.D) { return expr; }
    var args = [];
    if (messageBegin) { args.push(messageBegin); }
    args.push(expr);
    if (messageEnd)   { args.push(messageEnd); }

    console.log.apply(console, args);
    return expr;
};
