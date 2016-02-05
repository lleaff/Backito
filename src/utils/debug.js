module.exports = function debug() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift('DEBUG{');
    args.push('}');
    console.log.apply(console, args);
};
