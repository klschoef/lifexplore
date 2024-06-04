import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubmissionLogService {

  private localStorageKey = 'submissionLog';
  public submissionLog$ = new BehaviorSubject<any>(this.loadLogFromLocalStorage());
  public logOrModeChange$ = new BehaviorSubject(null);

  constructor() {
    const savedLog = this.loadLogFromLocalStorage();
    if (savedLog) {
      this.submissionLog$.next(savedLog);
    }
  }

  addEntryToLog(image: string, success: boolean, indeterminate: boolean, undecidable: boolean, evaluation: string, requestError: boolean, errorObject?: any, responseObject?: any) {
    let log = this.submissionLog$.value;

    if (!log[evaluation]) {
      log[evaluation] = [];
    }
    const newEntry = {
      success: success,
      indeterminate: indeterminate,
      requestError: requestError,
      undecidable: undecidable,
      errorObject: errorObject,
      responseObject: responseObject,
      image: image };
    log[evaluation].push(newEntry);
    this.submissionLog$.next(log);
    this.logOrModeChange$.next(null);
    this.saveLogToLocalStorage(log);
  }

  getEntryToLog(evaluation: string) {
    return this.submissionLog$.value[evaluation];
  }

  private saveLogToLocalStorage(log: any) {
    try {
      const serializedLog = JSON.stringify(log);
      localStorage.setItem(this.localStorageKey, serializedLog);
    } catch (e) {
      console.error("Could not save log to local storage", e);
    }
  }

  private loadLogFromLocalStorage(): any {
    try {
      const serializedLog = localStorage.getItem(this.localStorageKey);
      if (serializedLog === null) {
        return {};
      }
      return JSON.parse(serializedLog);
    } catch (e) {
      console.error("Could not load log from local storage", e);
      return {};
    }
  }
}
