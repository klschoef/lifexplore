import { Injectable } from '@angular/core';
import {ExpLogService} from './exp-log.service';
import {QueryResultLog, RankedAnswer} from '../../../../openapi/dres';

@Injectable({
  providedIn: 'root'
})
export class QueryResultLogService {

  constructor(
    private expLogService: ExpLogService
  ) { }

  public logQueryResult(queryTimestamp: number, sortType: string, resultSetAvailability: string, logResults: RankedAnswer[]) {
    let log : QueryResultLog = {
      timestamp: queryTimestamp,
      sortType: sortType,
      resultSetAvailability: resultSetAvailability, //top-k, for me: all return items
      results: logResults,
      events: this.expLogService.queryEvents
    }
    this.expLogService.resultLog.push(log);
  }
}
