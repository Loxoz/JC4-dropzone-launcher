class VFSSource {
    priority;
    /**
     * Instance of the VFS Source
     * @param {Number} priority sets the priority of this source
     */
    constructor(priority) {
        this.priority = priority;
    }

    /**
     * Returns the command line value of this VFS Source
     * @returns {String} command line argument
     */
    getCommandLine() {}
}

class VFSFileSystem extends VFSSource {
    path;
    /**
     * Creates a new VFS FileSystem
     * @param {String} path Path of the VFS FileSystem
     * @param {Number} priority Priority of the VFS Source
     */
    constructor(path, priority) {
        super(priority);
        this.path = path;
    }

    getCommandLine() {
        return `--vfs-fs ${quote(this.path)}`;
    }
}

class VFSArchive extends VFSSource {
    path;
    /**
     * Creates a new VFS Archive
     * @param {String} path Path of the VFS Archive
     * @param {Number} priority Priority of the VFS Source
     */
    constructor(path, priority) {
        super(priority);
        this.path = path;
    }

    getCommandLine() {
        return `--vfs-archive ${quote(this.path)}`;
    }
}

/**
 * Adds quotes around and escape existing quotes to string if needed
 * @param {String} string input string
 */
function quote(string) {
    if (typeof string == "string" && string.indexOf('"') >= 0) {
        return `"${string.split('"').join('\\"')}"`;
    }
    else {
        return string;
    }
}

module.exports = { VFSSource, VFSArchive, VFSFileSystem };
