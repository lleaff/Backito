module.exports = function removeTrailing(str, ch = '/') {
    if (str.substr(str.length - 1) === ch)
        return str.substring(0, length -  1);
    else
        return str;
};
