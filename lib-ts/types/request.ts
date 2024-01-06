import { AxiosDefaults, ResponseType } from "axios";

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

export function requestCallback(
  e: Error,
  r: ResponseType,
  f: ResponseType | Error
) {}

export type requestOptions = AxiosDefaults & {
  method?: requestMethodType;
  // headers?: defaultHeaderType;
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
  returnOriginalResponse?: boolean;
};
