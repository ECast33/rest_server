import {Router} from "express";
import Config from "app-config";

export interface ICoreRoutes {
    get CREATE_ENDPOINT(): string;

    get UPDATE_ENDPOINT(): string;

    get DELETE_ENDPOINT(): string;

    get GET_ONE_ENDPOINT(): string;

    get GET_MANY_ENDPOINT(): string;

    get LOOKUP_ENDPOINT(): string;

    get router(): Router;

    get baseUrl(): string;
}

export abstract class CoreRoutes implements ICoreRoutes {
    private BASE_URL: string = Config.app.API_BASE_ROUTE;
    private _CREATE_ENDPOINT: string = this.baseUrl;
    private _DELETE_ENDPOINT: string = this.baseUrl;
    private _GET_MANY_ENDPOINT: string = this.baseUrl;
    private _LOOKUP_ENDPOINT: string = this.baseUrl;
    private _GET_ONE_ENDPOINT: string = this.baseUrl;
    private _UPDATE_ENDPOINT: string = this.baseUrl;

    protected _router: Router;

    protected constructor() {
    }

    get CREATE_ENDPOINT(): string {
        return this._CREATE_ENDPOINT;
    }

    get DELETE_ENDPOINT(): string {
        return this._DELETE_ENDPOINT;
    }

    get GET_MANY_ENDPOINT(): string {
        return this._GET_MANY_ENDPOINT;
    }

    get GET_ONE_ENDPOINT(): string {
        return this._GET_ONE_ENDPOINT;
    }

    get LOOKUP_ENDPOINT(): string {
        return this._LOOKUP_ENDPOINT;
    }

    get UPDATE_ENDPOINT(): string {
        return this._UPDATE_ENDPOINT;
    }

    get baseUrl(): string {
        return this.BASE_URL;
    }

    get router(): Router {
        return this._router;
    }

}

