import { Injectable } from '@angular/core';
import {GUIAction, GUIActionType} from '../models/gui-action';
import {getTimestampInSeconds} from '../../global-constants';
import {ExpLogService} from './exp-log.service';
import URLUtil from '../utils/url-util';

@Injectable({
  providedIn: 'root'
})
export class InteractionLogService {
  constructor(
    private expLogService: ExpLogService,
  ) {  }

  public logFullImageDisplay(index: number, url: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.INSPECTFULLIMAGE,
      item: index,
      info: URLUtil.removeBaseURL(url)
    };
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logFullImageHide(index: number, url: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.HIDEFULLIMAGE,
      item: index,
      info: URLUtil.removeBaseURL(url)
    };
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logShowHelp(page: string, results: string[]) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.SHOWHELP,
      page: page,
      results: results
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logTextQuery(info: string, page: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.TEXTQUERY,
      info: info,
      page: page
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logSimilarityQuery(item: number, page: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.SIMILARITY,
      item: item,
      page: page
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logFileSimilarityQuery(info: string, page: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.FILESIMILARITY,
      info: info,
      page: page
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logHistoryQuery(info: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.HISTORYQUERY,
      info: info,
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logClearQuery() {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.CLEARQUERY
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logResetQuery(page: string, results: string[]) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.RESETQUERY,
      page: page,
      results: results
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logSubmitAnswer(info: string) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.SUBMITANSWER,
      info: info
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public logSubmit(info: string, item: number) {
    let GUIaction: GUIAction = {
      timestamp: getTimestampInSeconds(),
      actionType: GUIActionType.SUBMIT,
      info: info,
      item: item
    }
    this.expLogService.interactionLog.push(GUIaction);
  }

  public updateLatestResults(results: string[]) {
    this.expLogService.interactionLog[this.expLogService.interactionLog.length-1].results = results;
  }
}
