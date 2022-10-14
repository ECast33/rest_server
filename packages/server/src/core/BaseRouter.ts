import {Router} from "express";
import Config from "app-config";

export abstract class BaseRouter {
    protected _router: Router;

    protected constructor() {
        this._router = Router();
    }

    get router(): Router {
        return this._router;
    }

    baseUrl() {
        return `${Config.app.API_BASE_ROUTE}`
    }
}

