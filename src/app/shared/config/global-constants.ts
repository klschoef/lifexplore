import { LocalConfig } from "./local-config";

//console.log(videoShots)

//export var vbsServerConnectionService: VBSServerConnectionService | undefined;

//export var queryHistory:Array<string> = [];

export enum WebSocketEvent {
  UNSET = 'unset',
  CLOSE = 'disconnected',
  OPEN = 'connected',
  SEND = 'sending',
  MESSAGE = 'message',
  ERROR = 'error'
}

export enum WSServerStatus {
  UNSET = 'unset',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected'
}

export interface QueryType {
  type: string;
  query?: string;
  query_dicts?: any;
  maxresults: number;
  resultsperpage: number;
  selectedpage?: string;
  queryMode: string;
}

/*
export interface LogResultItem {
  item: string;
  frame: string;
  score: number;
  rank: number;
}

export interface LogQueryEvent {
  timestamp: number;
  category: string;
  type: string;
  value: string;
}

export interface ResultLog {
    timestamp: number;
    source: string;
    sortType: string;
    resultSetAvailability: string,
    results: Array<LogResultItem>,
    evets: Array<LogQueryEvent>
}
*/

export class GlobalConstants {
  public static configVBSSERVER = 'https://vbs.videobrowsing.org';

  public static clipServerURL: string = 'ws://' + LocalConfig.config_CLIP_SERVER_HOST + ':' + LocalConfig.config_CLIP_SERVER_PORT;
  public static nodeServerURL: string = 'ws://' + LocalConfig.config_NODE_SERVER_HOST + ':' + LocalConfig.config_NODE_SERVER_PORT;
  public static dataHost = LocalConfig.config_DATA_BASE_URL;
  public static uploadServerURL = LocalConfig.config_UPLOAD_URL;

  public static keyframeBaseURL: string = this.dataHost;
  public static keyframeThumbsBaseURL: string = LocalConfig.config_DATA_BASE_URL_THUMBS;

  public static MAX_RESULTS_TO_DISPLAY = LocalConfig.config_MAX_RESULTS_TO_DISPLAY;
}

export function twoDigits(str:string):string {
  if (str.length < 2) {
    return `0${str}`;
  } else {
    return str;
  }
}

export function formatAsTime(frame:string, fps:number, withFrames:boolean=true) {
  let ff = Math.floor(parseInt(frame) % fps);
  let secs = parseInt(frame) / fps;
  let ss = Math.floor(secs % 60);
  let mm = Math.floor(secs / 60);
  let hh = Math.floor(secs / 3600);
  let timeString = `${twoDigits(hh.toString())}:${twoDigits(mm.toString())}:${twoDigits(ss.toString())}`;
  if (withFrames) {
    return `${timeString}.${ff}`
  } else {
    return timeString;
  }
}

export function getTimestampInSeconds () {
  return Math.floor(Date.now() / 1000)
}
/**
 * EXAMPLE OF LOCAL CONFIG (local-config.ts)
 *
 export class LocalConfig {
    public static config_CLIP_SERVER_HOST = 'extreme00.itec.aau.at'; //localhost
    public static config_CLIP_SERVER_PORT = '8001';

    public static config_DATA_BASE_URL = 'http://extreme00.itec.aau.at/diveXplore/'; //http://localhost/divexplore/
}
 */
