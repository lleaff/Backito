module.exports = function ifElseErr(callback, errCallback) {
    return function (err) {
        if (err) { errCallback.apply(this, arguments); }
        else { callback.apply(this, arguments); }
    };
};
