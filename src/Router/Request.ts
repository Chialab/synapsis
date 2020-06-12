import { Router } from './Router';
import { Response } from './Response';

/**
 * A set of params extracted from the request path.
 */
export interface RequestParams {
    [key: string]: string;
}

/**
 * A class representing a new page request in the app.
 */
export class Request<T extends RequestParams = RequestParams> {
    private _response?: Response;
    private _error?: Error;

    /**
     * A set of params extracted from the request path.
     */
    public params?: T = {} as T;

    /**
     * The resolving state of the request.
     */
    get resolving() {
        return !this.response;
    }

    /**
     * The resolved state of the request.
     */
    get resolved() {
        return !!this.response;
    }

    /**
     * The response instance for the request.
     */
    get response() {
        return this._response;
    }

    /**
     * The error instance for the request.
     */
    get error() {
        return this._error;
    }

    /**
     * Create a Request instance.
     * @param router The Router instance of the request.
     * @param path The path to navigate.
     */
    constructor(protected router: Router, public path: string) {}

    /**
     * Set params to the request.
     * @param params The params to set.
     */
    set(params: T) {
        this.params = params;
    }

    /**
     * Resolve the request.
     * @param res The response which resolves the request.
     */
    resolve(res: Response) {
        this._response = res;
    }

    /**
     * Mark the request as errored.
     * @param err The error which rejectes the request.
     */
    reject(err: Error) {
        this._error = err;
    }
}