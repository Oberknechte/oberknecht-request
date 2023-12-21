import { AxiosDefaults, ResponseType } from "axios";
export declare const requestMethods: readonly ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
export type requestMethodType = typeof requestMethods[number];
export declare const defaultHeaders: readonly ["Authorization", "Auth", "Accept", "Accept-Encoding", "Accept-Language", "Content-Type", "Content-Encoding", "Content-Language"];
export type defaultHeaderType = Record<typeof defaultHeaders[number], string | any>;
export declare function requestCallback(e: Error, r: ResponseType, f: ResponseType | Error): void;
export type requestOptions = AxiosDefaults & {
    method?: requestMethodType;
    body?: string;
    json?: boolean;
};
export type globalOptions = {
    callbackOptions?: {
        callback: Function;
    };
    returnAfter?: boolean;
    options?: requestOptions;
    delayBetweenRequests?: number;
};
