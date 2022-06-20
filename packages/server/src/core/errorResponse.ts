import {StatusCodes} from "http-status-codes";

export interface IErrorResponse {
    message: string
    data?: object;
    statusCode?: number;
}

export class ErrorResponse extends Error {

    private _statusCode: number;
    private _data: object;

    constructor(error: IErrorResponse) {
        super(error.message);
        this._statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
        Object.assign(error)
    }

    get statusCode(): number {
        return this._statusCode;
    }

    set statusCode(value: number) {
        this._statusCode = value;
    }

    get data(): object {
        return this._data;
    }

    set data(value: object) {
        this._data = value;
    }


}
