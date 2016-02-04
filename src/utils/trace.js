module.exports = function trace(expr, messageBegin, messageEnd) {
    var args = [messageBegin, expr, messageEnd].filter(x => x);
    console.log.apply(console, args);
    return expr;
};
