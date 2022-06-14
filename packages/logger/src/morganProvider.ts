import express from "express";
import morgan from "morgan";

export class MorganProvider {
    constructor(private app: express.Express) {

    }

    init() {
        // this.app.use(morgan(function (tokens, req, res) {
        //     return [
        //         tokens.method(req, res),
        //         tokens.url(req, res),
        //         tokens.status(req, res),
        //         tokens.res(req, res, 'content-length'), '-',
        //         tokens['response-time'](req, res), 'ms'
        //     ].join(' ')
        // })); // custom morgan
        
        if (process.env.NODE_ENV === 'prod') {
            this.app.use(morgan('tiny'));
        } else {
            this.app.use(morgan('dev'));
        }
    }
}
