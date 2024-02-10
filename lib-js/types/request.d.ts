import { AxiosError, AxiosRequestConfig, RawAxiosRequestHeaders } from "axios";
import { AxiosResponse } from "axios";
export declare const requestMethods: readonly ["CONNECT", "DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT", "TRACE"];
export declare type requestMethodType = typeof requestMethods[number];
export declare const defaultHeaders: readonly ["Authorization", "Auth", "Accept", "Accept-Encoding", "Accept-Language", "Content-Type", "Content-Encoding", "Content-Language"];
export declare type defaultHeaderType = Record<typeof defaultHeaders[number], string | any>;
export declare type requestResponse = Record<string, any> | AxiosResponse;
export declare type requestErrorResponse = AxiosError;
export declare function requestCallback(e: requestErrorResponse, r: requestResponse, f: requestResponse | requestErrorResponse): void;
export declare type requestOptions = {
    method?: requestMethodType;
    headers?: defaultHeaderType | Record<string, any> | RawAxiosRequestHeaders;
    body?: string;
} & AxiosRequestConfig;
export declare type globalOptions = {
    callbackOptions?: {
        callback: Function;
    };
    returnAfter?: boolean;
    options?: requestOptions;
    delayBetweenRequests?: number;
    returnOriginalResponse?: boolean;
    noWorker?: boolean;
    maxRequestsPerWorker?: number;
    checkCloseWorkerInterval?: number;
    keepWorkerActiveNum?: number;
};
