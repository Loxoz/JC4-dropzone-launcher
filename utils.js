/**
 * Checks if a file/folder is accessible
 * @param {PathLike} path A path to a file or directory. If a URL is provided, it must use the file: protocol. URL support is experimental.
 * @param {Number} mode A number for access mode like unix
 * @param {require('fs')} fs fs module
 * @returns {boolean} file/folder is accessible
 */
function access(path, mode, fs = require('fs')) {
    try {
        fs.accessSync(path, mode)
        return true;
    }
    catch (ex) {
        return false;
    }
}
/**
 * Checks if a file/folder exists
 * @param {PathLike} path A path to a file or directory. If a URL is provided, it must use the file: protocol. URL support is experimental.
 * @param {require('fs')} fs fs module
 * @returns {boolean} file/folder exists
 */
function exists(path, fs = require('fs')) {
    return access(path, fs.constants.F_OK, fs);
}
/**
 * Checks if a file can be executed
 * @param {PathLike} path A path to a file or directory. If a URL is provided, it must use the file: protocol. URL support is experimental.
 * @param {require('fs')} fs fs module
 * @returns {boolean} file can be executed
 */
function canExecute(path, fs = require('fs')) {
    return access(path, fs.constants.X_OK, fs);
}
/**
 * Checks if a path is a file
 * @param {PathLike} path A path to a file or directory. If a URL is provided, it must use the file: protocol. URL support is experimental.
 * @param {require('fs')} fs fs module
 * @returns {boolean} path is a file
 */
function isFile(path, fs = require('fs')) {
    try {
        return fs.statSync(path).isFile();
    } catch (ex) {
        return false;
    }
}

module.exports = { access, exists, canExecute, isFile };
