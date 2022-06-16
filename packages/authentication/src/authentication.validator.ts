import {Request, Response} from 'express';
import {StatusCodes} from "http-status-codes";

export class AuthenticationValidator {

    login(req: Request, res: Response, next) {
        let valid = true;
        let errorMessage = '';
        try {
            if (!req.body) throw new Error('Bad body');
            if (typeof req.body.username !== 'string') throw new Error('Bad username');
            if (typeof req.body.password !== 'string') throw new Error('Bad password');
            if (req.body.password.length <= 4) throw new Error('Bad password.length < 4');
            if (req.body.password.length === 0) throw new Error('Enter a password');

        } catch (error: any) {
            valid = false;
            errorMessage = error.message;
        }

        if (valid) {
            next();
        } else {
            res.status(StatusCodes.BAD_REQUEST);
            res.json({error: errorMessage});
            res.end();
        }
    }
}
