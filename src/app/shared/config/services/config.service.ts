import { Injectable } from '@angular/core';
import { LocalConfig } from '../local-config';
import { GlobalConstants } from '../global-constants';
import {BehaviorSubject} from 'rxjs';

export const LOCALSTORAGE_FIELDNAME = 'lifeXploreConfig';

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
      config_NODE_SERVER_HOST: LocalConfig.config_NODE_SERVER_HOST,
      config_NODE_SERVER_PORT: LocalConfig.config_NODE_SERVER_PORT,
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
    return `wss://${this.config.config_NODE_SERVER_HOST}:${this.config.config_NODE_SERVER_PORT}/ws`;
    //return GlobalConstants.nodeServerURL;
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
    GlobalConstants.nodeServerURL = `ws://${config.config_NODE_SERVER_HOST}:${config.config_NODE_SERVER_PORT}`;
    GlobalConstants.dataHost = config.config_DATA_BASE_URL;
    GlobalConstants.uploadServerURL = config.config_UPLOAD_URL;
    GlobalConstants.keyframeBaseURL = config.config_DATA_BASE_URL;
    GlobalConstants.keyframeThumbsBaseURL = config.config_DATA_BASE_URL_THUMBS;
    GlobalConstants.MAX_RESULTS_TO_DISPLAY = config.config_MAX_RESULTS_TO_DISPLAY;
  }
}
