var cargs = require('../args');

module.exports = function trace(expr, messageBegin, messageEnd) {
    if (!cargs.D) { return expr; }
    var args = [messageBegin, expr, messageEnd].filter(x => x);
    console.log.apply(console, args);
    return expr;
};
