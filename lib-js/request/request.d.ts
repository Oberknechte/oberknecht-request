import { globalOptions, requestOptions } from "../types/request";
import { RequestCallback, Response } from "request";
export declare function request(url: string, options?: requestOptions | RequestCallback, callback?: RequestCallback, globalOptions?: globalOptions): Promise<Response>;
