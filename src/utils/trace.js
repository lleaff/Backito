module.exports = function trace(expr, message) {
    if (message)
        console.log(message, expr);
    else
        console.log('trace:', expr);
    return expr;
};
