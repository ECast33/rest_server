import {Router} from "express";
import Config from "app-config";

export class BaseRouter {
    protected _router: Router;

    constructor() {
        this._router = Router();
    }

    get router(): Router {
        return this._router;
    }

    baseUrl() {
        return `${Config.app.API_BASE_ROUTE}`
    }
}
