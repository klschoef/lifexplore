import { Injectable } from '@angular/core';
import {QueryType} from '../../shared/config/global-constants';

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  public static LOCAL_STORAGE_KEY = 'history';

  constructor() { }

  public fetch_raw_history_object() {
    return localStorage.getItem(HistoryService.LOCAL_STORAGE_KEY)
  }

  public fetch_history() {
    let historyList = [];
    let hist = this.fetch_raw_history_object();
    if (hist) {
      let histj:[QueryType] = JSON.parse(hist);
      for (let i=0; i < histj.length; i++) {
        let ho = histj[i];
        historyList.push(`${ho.type}: ${ho.query} (${ho.queryMode})`)
      }
    }
    return historyList;
  }

  saveToHistory(msg: QueryType) {
    if (msg.query === '' && msg.query_dicts.length === 0) {
      return;
    }

    let hist = this.fetch_raw_history_object();
    if (hist) {
      let queryHistory:Array<QueryType> = JSON.parse(hist);
      let containedPos = -1;
      let i = 0;
      for (let qh of queryHistory) {
        if (qh.query === msg.query && qh.queryMode === msg.queryMode && qh.query_dicts === msg.query_dicts) {
          containedPos = i;
          break;
        }
        i++;
      }
      if (containedPos >= 0) {
        queryHistory.splice(containedPos,1);
        queryHistory.unshift(msg);
        this.replaceHistory(queryHistory)
      }
      else {
        queryHistory.unshift(msg);
        this.replaceHistory(queryHistory)
      }
    } else {
      let queryHistory:Array<QueryType> = [msg];
      this.replaceHistory(queryHistory)
    }
  }

  public replaceHistory(history: Array<QueryType>) {
    localStorage.setItem('history', JSON.stringify(history));
  }
}
