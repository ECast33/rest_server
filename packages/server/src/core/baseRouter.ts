import {Router} from "express";
import Config from "app-config";
import {CoreRoutes} from "./interfaces/IcoreRoutes";

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

