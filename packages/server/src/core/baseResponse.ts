export class BaseResponse {


    private _code: number;
    private _message: string;
    private _errors: Array<string>;

    constructor() {
        this._message = 'ok';
        this._errors = new Array<string>();
    }

    get errors(): Array<string> {
        return this._errors;
    }

    set errors(value: Array<string>) {
        this._errors = value;
    }

    get message(): string {
        return this._message;
    }

    set message(value: string) {
        this._message = value;
    }

    get code(): number {
        return this._code;
    }

    set code(value: number) {
        this._code = value;
    }

}
