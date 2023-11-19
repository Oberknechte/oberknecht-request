import { CoreOptions, RequestResponse } from "request";
export declare const requestMethods: readonly ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
export declare type requestMethodType = typeof requestMethods[number];
export declare const defaultHeaders: readonly ["Authorization", "Auth", "Accept", "Accept-Encoding", "Accept-Language", "Content-Type", "Content-Encoding", "Content-Language"];
export declare type defaultHeaderType = Record<typeof defaultHeaders[number], string | any>;
export declare const requestCallback: (e: Error, r: RequestResponse, f: RequestResponse | Error) => void;
export declare type requestOptions = CoreOptions & {
    method?: requestMethodType;
    headers?: defaultHeaderType;
    body?: string;
    json?: boolean;
};
export declare type globalOptions = {
    callbackOptions?: {
        callback: Function;
    };
    returnAfter?: boolean;
    options?: requestOptions;
    delayBetweenRequests?: number;
};
