import { RequestResponse } from "request";

export const requestMethods = ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"] as const;
export type requestMethodType = typeof requestMethods[number];

export const defaultHeaders = ["Authorization", "Auth", "Accept", "Accept-Encoding", "Accept-Language", "Content-Type", "Content-Encoding", "Content-Language"] as const;
export type defaultHeaderType = Record<typeof defaultHeaders[number], string | any>;

export const requestCallback = (e: Error, r: RequestResponse, f: RequestResponse | Error) => { };

export type requestOptions = {
    method?: requestMethodType,
    headers?: defaultHeaderType,
    body?: string,
    json?: boolean
};

export type globalCallbackOptions = {
    returnAfter?: boolean,
    callback: Function,
}