import {Router} from "express";
import Config from "app-config";

export interface ICoreRoutes {
    _router: Router;
    CREATE_ENDPOINT: string;
    UPDATE_ENDPOINT: string;
    DELETE_ENDPOINT: string;
    READ_ONE_ENDPOINT: string;
    LOOKUP_ENDPOINT: string;
    READ_ALL_ENDPOINT: string;

    get router(): Router;
}

export abstract class CoreRoutes implements ICoreRoutes {
    BASE_URL: string;
    CREATE_ENDPOINT: string;
    DELETE_ENDPOINT: string;
    LOOKUP_ENDPOINT: string;
    READ_ALL_ENDPOINT: string;
    READ_ONE_ENDPOINT: string;
    UPDATE_ENDPOINT: string;
    _router: Router;

    get router(): Router {
        return this._router;
    }

    get baseUrl() {
        return this.BASE_URL;
    }
}

