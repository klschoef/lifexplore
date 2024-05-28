import { Injectable } from '@angular/core';
import {GUIAction} from '../models/gui-action';
import {LogService, QueryEvent, QueryResultLog} from '../../../../openapi/dres';
import {catchError, of, tap} from 'rxjs';
import {VBSServerConnectionService} from './vbsserver-connection.service';

@Injectable({
  providedIn: 'root'
})
export class ExpLogService {

  interactionLog: Array<GUIAction> = [];
  queryEvents: Array<QueryEvent> = [];
  resultLog: Array<QueryResultLog>  = [];

  constructor(
    private logService: LogService,
    private connectionService: VBSServerConnectionService
  ) { }

  saveLogLocallyAndClear() {
    if (this.resultLog.length > 0) {
      this.addToLogInLocalStorage('LSCResultLog', this.resultLog);
      this.resultLog = [];
    }
    if (this.queryEvents.length > 0) {
      this.addToLogInLocalStorage('LSCQueryEvents', this.queryEvents);
      this.queryEvents = [];
    }
    if (this.interactionLog.length > 0) {
      console.log(`interactionlog has ${this.interactionLog.length} entries`);
      this.addToLogInLocalStorage('LSCInteractionLog', this.interactionLog);
      this.interactionLog = [];
    }
  }

  addToLogInLocalStorage(name:string, myLog:any) {
    let log = localStorage.getItem(name);
    if (log) {
      let loga = JSON.parse(log);
      loga.push(myLog);
      localStorage.setItem(name,JSON.stringify(loga));
    } else {
      let loga  = [myLog];
      localStorage.setItem(name,JSON.stringify(loga));
    }
  }

  submitLog() {
    if (this.resultLog.length > 0 && this.queryEvents.length > 0) {
      this.resultLog[this.resultLog.length-1].events = this.queryEvents;
      // TODO: fix this
      //this.logService.postApiV2LogResultByEvaluationId(this.resultLog[this.resultLog.length-1], this.connectionService.sessionId!)
      /*this.logService.postApiV1LogResult(this.connectionService.sessionId!, this.resultLog[this.resultLog.length-1]).pipe(
        tap(o => {
          console.log(`Successfully submitted result log to DRES!`);
        }),
        catchError((err) => {
          return of(`Failed to submit segment to DRES due to a HTTP error (${err.status}).`)
        })
      ).subscribe();*/
    }
  }
}
