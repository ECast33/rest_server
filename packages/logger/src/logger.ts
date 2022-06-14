export class Logger {
    private logger: any

    constructor() {
        this.logger = require('custom-logger').config({
            format: '[%timestamp%][%event%]%padding%%message%'
        });

        this.logger.new({fatal: {level: 5, event: 'fatal', color: 'magenta'}});
    }

    public debug(...args: any[]) {
        this.logger.debug(...args);
    }

    public error(...args: any[]) {
        this.logger.error(...args);
    }

    public fatal(...args: any[]) {
        this.logger.fatal(...args);
    }

    public info(...args: any[]) {
        this.logger.info(...args);
    }

    public warn(...args: any[]) {
        this.logger.warn(...args);
    }

}
