import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {ApiClientTaskTemplateInfo, ApiEvaluationState} from '../../../../openapi/dres';

@Injectable({
  providedIn: 'root'
})
export class SubmissionLogService {

  private localStorageKey = 'submissionLog';
  private localStorageKeyTaskLog = 'taskLog';
  public submissionLog$ = new BehaviorSubject<any>(this.loadLogFromLocalStorage());
  public taskLog$ = new BehaviorSubject<any>(this.loadTaskLogFromLocalStorage());
  public logOrModeChange$ = new BehaviorSubject(null);

  constructor() {
    const savedLog = this.loadLogFromLocalStorage();
    if (savedLog) {
      this.submissionLog$.next(savedLog);
    }
  }

  addEntryToLog(options: {
    image: string;
    success: boolean;
    indeterminate: boolean;
    undecidable: boolean;
    evaluation: string;
    task: ApiEvaluationState;
    requestError: boolean;
    errorObject?: any;
    responseObject?: any;
  }) {
    let log = this.submissionLog$.value;

    if (!log[options.evaluation]) {
      log[options.evaluation] = {};
    }

    const evaluation = log[options.evaluation];

    if (!evaluation[options.task.taskId!]) {
      evaluation[options.task.taskId!] = [];
    }

    const newEntry = {
      success: options.success,
      indeterminate: options.indeterminate,
      requestError: options.requestError,
      undecidable: options.undecidable,
      errorObject: options.errorObject,
      responseObject: options.responseObject,
      image: options.image
    };

    evaluation[options.task.taskId!].push(newEntry);
    // log[options.evaluation].push(newEntry);
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

  public clearSubmissionLog() {
    localStorage.setItem(this.localStorageKey, '{}');
  }

  private saveTaskLogToLocalStorage(log: any) {
    try {
      const serializedLog = JSON.stringify(log);
      localStorage.setItem(this.localStorageKeyTaskLog, serializedLog);
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

  private loadTaskLogFromLocalStorage(): any {
    try {
      const serializedLog = localStorage.getItem(this.localStorageKeyTaskLog);
      if (serializedLog === null) {
        return {};
      }
      return JSON.parse(serializedLog);
    } catch (e) {
      console.error("Could not load task log from local storage", e);
      return {};
    }
  }
}
