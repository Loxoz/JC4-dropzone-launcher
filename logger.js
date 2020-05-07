class Logger {
    /**
     * Creates a new logger
     */
    constructor() {}

    debug(...message) {
        console.debug(this.format("DEBUG", ...message));
    }

    info(...message) {
        console.debug(this.format(null, ...message));
    }
    log(...message) {
        this.info(...message);
    }

    warn(...message) {
        console.warn(this.format("WARN", ...message));
    }

    error(...message) {
        console.error(this.format("ERROR", ...message));
    }

    fatal(...message) {
        console.error(this.format("FATAL", ...message));
    }

    format(type = "INFO", ...message) {
        return `${type ? type + ": " : ""}${message.map((v, i) => v instanceof Error ? v.stack : v ).join(" ")}`;
    }
}

module.exports = Logger;
