import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ResultPresenterService {
  currentPage$ = new BehaviorSubject<number | undefined>(undefined);
  maxResultsForCurrentPage$ = new BehaviorSubject<number>(0);
  maxPages$ = new BehaviorSubject<number>(0);
  currentResultIndex$ = new BehaviorSubject<number | undefined>(undefined);
  resetQuery$ = new BehaviorSubject<boolean>(false);
  focusQuery$ = new BehaviorSubject<boolean>(false);
  selectQuery$ = new BehaviorSubject<boolean>(false);
  showHistory$ = new BehaviorSubject<boolean>(false);
  showHelp$ = new BehaviorSubject<boolean>(false);
  showTuning$ = new BehaviorSubject<boolean>(false);
  triggerSearch$ = new BehaviorSubject<boolean>(false);

  constructor() { }

  previousResult(navigateToPreviousPage = true) {
    if (!this.currentResultIndex$.value) {
      if (navigateToPreviousPage) {
        this.currentPage$.next((this.currentPage$.value ?? 1 ) - 1);
        // TODO: also update the maxResultsForCurrentPage$ value
        // TODO: like this, but that is probably not working as expected for the last page, because there are probably less elements, then the page before.
        this.currentResultIndex$.next(this.maxResultsForCurrentPage$.value - 1);
      }
      return;
    }
    this.currentResultIndex$.next(this.currentResultIndex$.value - 1);
  }

  nextResult() {
    if (this.currentResultIndex$.value === this.maxResultsForCurrentPage$.value - 1) {
      if (this.currentPage$.value ?? 1 < this.maxPages$.value - 1) {
        this.currentPage$.next((this.currentPage$.value ?? 1) + 1);
        this.currentResultIndex$.next(0);
      }
      console.log("next result here!");
      return;
    }
    this.currentResultIndex$.next((this.currentResultIndex$.value ?? 0) + 1);
    console.log("next result here2!");
  }

  previousPage() {
    this.currentPage$.next((this.currentPage$.value ?? 1) - 1);
  }

  nextPage() {
    this.currentPage$.next((this.currentPage$.value ?? 1) + 1);
  }
}
