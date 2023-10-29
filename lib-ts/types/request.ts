import { CoreOptions, Request, RequestResponse } from "request";

export const requestMethods = [
  "CONNECT",
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
  "TRACE",
] as const;
export type requestMethodType = typeof requestMethods[number];

export const defaultHeaders = [
  "Authorization",
  "Auth",
  "Accept",
  "Accept-Encoding",
  "Accept-Language",
  "Content-Type",
  "Content-Encoding",
  "Content-Language",
] as const;
export type defaultHeaderType = Record<
  typeof defaultHeaders[number],
  string | any
>;

export const requestCallback = (
  e: Error,
  r: RequestResponse,
  f: RequestResponse | Error
) => {};

export type requestOptions = CoreOptions & {
  method?: requestMethodType;
  headers?: defaultHeaderType;
  body?: string;
  json?: boolean;
};

export type globalOptions = {
  callbackOptions?: {
    callback: Function;
  };
  returnAfter?: boolean;
  options?: requestOptions;
};
