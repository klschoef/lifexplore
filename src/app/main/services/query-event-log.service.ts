import { Injectable } from '@angular/core';
import {ExpLogService} from './exp-log.service';
import {QueryEvent} from '../../../../openapi/dres';
import {getTimestampInSeconds} from '../../global-constants';

@Injectable({
  providedIn: 'root'
})
export class QueryEventLogService {

  constructor(
    private expLogService: ExpLogService,
  ) {}

  public logJointEmbedding(query: string) {
    let queryEvent:QueryEvent = {
      timestamp: getTimestampInSeconds(),
      category: QueryEvent.CategoryEnum.TEXT,
      type: 'jointEmbedding',
      value: query
    }
    this.expLogService.queryEvents.push(queryEvent);
  }

  public logFeedbackModel(query: string) {
    let queryEvent:QueryEvent = {
      timestamp: getTimestampInSeconds(),
      category: QueryEvent.CategoryEnum.IMAGE,
      type: 'feedbackModel',
      value: query
    }
    this.expLogService.queryEvents.push(queryEvent);
  }

  public logQueryRepetitionQuery(value: string) {
    let queryEvent:QueryEvent = {
      timestamp: getTimestampInSeconds(),
      category: QueryEvent.CategoryEnum.OTHER,
      type: 'queryRepetition',
      value: value
    }
    this.expLogService.queryEvents.push(queryEvent);
  }

  public logSubmitAnswer(value: string) {
    let queryEvent:QueryEvent = {
      timestamp: getTimestampInSeconds(),
      category: QueryEvent.CategoryEnum.OTHER,
      type: 'submitanswer',
      value: value
    }
    this.expLogService.queryEvents.push(queryEvent);
  }

  public logSubmit(value: string) {
    let queryEvent:QueryEvent = {
      timestamp: getTimestampInSeconds(),
      category: QueryEvent.CategoryEnum.OTHER,
      type: 'submit',
      value: value
    }
    this.expLogService.queryEvents.push(queryEvent);
  }
}
