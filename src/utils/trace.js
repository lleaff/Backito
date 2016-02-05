var args = require('../args');

module.exports = function trace(expr, messageBegin, messageEnd) {
    if (!args.D) { return; }
    var args = [messageBegin, expr, messageEnd].filter(x => x);
    console.log.apply(console, args);
    return expr;
};
