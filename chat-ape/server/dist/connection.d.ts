import { Db } from "mongodb";
export declare function connectData(callback: ConnectDataCallback): Promise<void>;
export declare const getData: () => Db;
