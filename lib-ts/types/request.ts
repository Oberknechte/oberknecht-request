import {
  AxiosHeaders,
  AxiosRequestConfig,
  HeadersDefaults,
  RawAxiosRequestHeaders,
} from "axios";
import { AxiosDefaults, AxiosResponse, ResponseType } from "axios";

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

export type requestResponse = Record<string, any> | AxiosResponse;

export function requestCallback(
  e: Error,
  r: requestResponse,
  f: requestResponse | Error
) {}

export type requestOptions = {
  method?: requestMethodType;
  headers?: defaultHeaderType | Record<string, any> | RawAxiosRequestHeaders;
  body?: string;
} & AxiosRequestConfig;

export type globalOptions = {
  callbackOptions?: {
    callback: Function;
  };
  returnAfter?: boolean;
  options?: requestOptions;
  delayBetweenRequests?: number;
  returnOriginalResponse?: boolean;
  noWorker?: boolean;
};
