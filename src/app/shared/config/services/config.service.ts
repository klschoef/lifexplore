import { Injectable } from '@angular/core';
import { LocalConfig } from '../local-config';
import { GlobalConstants } from '../global-constants';
import {BehaviorSubject} from 'rxjs';

export const LOCALSTORAGE_FIELDNAME = 'lifeXploreConfig';
type WebSocketServerPrefix = 'NODE' | 'CLIP';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;
  config$ = new BehaviorSubject<any>({});


  constructor() {
    this.loadConfig();
  }

  private loadConfig() { //Check all fields
    const localConfig = localStorage.getItem(LOCALSTORAGE_FIELDNAME);
    this.config = {
      ...this.getDefaultConfig(),
      ...(localConfig ? JSON.parse(localConfig) : {})
    };
    this.applyConfig(this.config);
    this.config$.next(this.config);
    console.log('Loaded config:', this.config); // Debugging statement
  }


  getDefaultConfig() {
    return {
      config_CLIP_SERVER_HOST: LocalConfig.config_CLIP_SERVER_HOST,
      config_CLIP_SERVER_PORT: LocalConfig.config_CLIP_SERVER_PORT,
      config_CLIP_SERVER_PROTOCOL: (LocalConfig as any).config_CLIP_SERVER_PROTOCOL ?? 'wss://',
      config_CLIP_SERVER_PATH: (LocalConfig as any).config_CLIP_SERVER_PATH ?? '',
      config_NODE_SERVER_HOST: LocalConfig.config_NODE_SERVER_HOST,
      config_NODE_SERVER_PORT: LocalConfig.config_NODE_SERVER_PORT,
      config_NODE_SERVER_PROTOCOL: (LocalConfig as any).config_NODE_SERVER_PROTOCOL ?? 'wss://',
      config_NODE_SERVER_PATH: (LocalConfig as any).config_NODE_SERVER_PATH ?? '/ws',
      config_DATA_BASE_URL: LocalConfig.config_DATA_BASE_URL,
      config_DATA_BASE_URL_THUMBS: LocalConfig.config_DATA_BASE_URL_THUMBS,
      config_USER: LocalConfig.config_USER,
      config_PASS: LocalConfig.config_PASS,
      config_UPLOAD_URL: LocalConfig.config_UPLOAD_URL,
      config_THUMB_WIDTH: LocalConfig.config_THUMB_WIDTH,
      config_THUMB_HEIGHT: LocalConfig.config_THUMB_HEIGHT,
      config_MAX_RESULTS_TO_RETURN: LocalConfig.config_MAX_RESULTS_TO_RETURN,
      config_RESULTS_PER_PAGE: LocalConfig.config_RESULTS_PER_PAGE,
      config_IMAGES_PER_ROW: LocalConfig.config_IMAGES_PER_ROW,
      config_MAX_RESULTS_TO_DISPLAY: LocalConfig.config_MAX_RESULTS_TO_DISPLAY,
    };
  }

  getConfiguration() {
    return this.config;
  }

  updateConfiguration(newConfig: any) {
    this.config = { ...this.config, ...newConfig };
    this.applyConfig(this.config);
    this.config$.next(this.config);
    localStorage.setItem(LOCALSTORAGE_FIELDNAME, JSON.stringify(this.config));
  }

  getNodeServerURL() {
    return this.buildWebSocketURL(this.config, 'NODE');
  }

  getKeyframeBaseUrl() {
    return this.config.config_DATA_BASE_URL;
  }

  getKeyframeThumbsBaseUrl() {
    return this.config.config_DATA_BASE_URL_THUMBS;
  }

  getMaxResultsToDisplay() {
    return this.config.config_MAX_RESULTS_TO_DISPLAY;
  }

  private applyConfig(config: any) {
    GlobalConstants.nodeServerURL = this.buildWebSocketURL(config, 'NODE');
    GlobalConstants.clipServerURL = this.buildWebSocketURL(config, 'CLIP');
    GlobalConstants.dataHost = config.config_DATA_BASE_URL;
    GlobalConstants.uploadServerURL = config.config_UPLOAD_URL;
    GlobalConstants.keyframeBaseURL = config.config_DATA_BASE_URL;
    GlobalConstants.keyframeThumbsBaseURL = config.config_DATA_BASE_URL_THUMBS;
    GlobalConstants.MAX_RESULTS_TO_DISPLAY = config.config_MAX_RESULTS_TO_DISPLAY;
  }

  private buildWebSocketURL(config: any, serverPrefix: WebSocketServerPrefix) {
    const protocol = config[`config_${serverPrefix}_SERVER_PROTOCOL`] ?? 'wss://';
    const host = String(config[`config_${serverPrefix}_SERVER_HOST`] ?? '')
      .trim()
      .replace(/^wss?:\/\//i, '')
      .replace(/\/.*$/, '');
    const port = config[`config_${serverPrefix}_SERVER_PORT`];
    const path = config[`config_${serverPrefix}_SERVER_PATH`] ?? '';
    const normalizedPath = path === '/ws' ? '/ws' : '';

    return `${protocol}${host}:${port}${normalizedPath}`;
  }
}
