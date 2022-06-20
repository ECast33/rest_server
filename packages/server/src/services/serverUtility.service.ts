import {Response} from 'express';
import {ErrorResponse} from "../core/errorResponse";
import {Logger} from "@imitate/logger";
import {StatusCodes} from "http-status-codes";
import {BaseResponse} from "../core/baseResponse";

export class ServerUtilityService {

    constructor(private logger: Logger) {
    }

    handleRestError(errorMessage: string, e: Error, res: Response) {
        this.logger.error(errorMessage, (e ? e.stack : ''));
        const response = new BaseResponse();
        if (e instanceof ErrorResponse) {
            res.status(e.statusCode);
            response.code = e.statusCode;
            response.message = e.message;
        } else {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR);
            response.code = StatusCodes.INTERNAL_SERVER_ERROR;
            response.message = "error"
        }
        response.errors.push(errorMessage);
        res.json(response);
        res.end();
    }

    handleSuccess(result: any, res: Response) {
        res.status(StatusCodes.OK);
        res.json(result);
        res.end();
    }
}
