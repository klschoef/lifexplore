import { Injectable } from '@angular/core';
import {ExpSearchAreaMode} from '../components/exp-search-area/exp-search-area.component';
import {
  SearchResultMode
} from '../components/settings/components/settings-view-results-mode/settings-view-results-mode.component';
import {ResultPresenterService} from './result-presenter.service';
import {SettingsService} from './settings.service';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShortcutService {

  public isInputFocusedSubject = new BehaviorSubject<boolean>(false);
  public shiftKeyIsPressedSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private resultPresenterService: ResultPresenterService,
    private settingsService: SettingsService
  ) { }

  handleKeyboardEventUp(event: KeyboardEvent) {
    this.shiftKeyIsPressedSubject.next(event.shiftKey);
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    console.log("event", event);
    this.shiftKeyIsPressedSubject.next(event.shiftKey);

    if (event.key === 'ArrowLeft') {
      console.log("ArrowLeft");
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.previousResult();
      }
    } else if (event.key === 'ArrowRight') {
      console.log("ArrowRight");
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.nextResult();
      }
    } else if (event.key === 'Enter' && event.shiftKey) {
      this.resultPresenterService.triggerSearch$.next(true);
      console.log("Enter + shift");
      //this.resultPresenterService.search$.next(true);
    } else if (event.key === 'Tab' && event.shiftKey) {
      console.log("Tab + shift");
      this.resultPresenterService.previousPage();
      event.preventDefault(); // Prevent tabbing to previous element
    } else if (event.key === 'Tab' && !event.shiftKey) {
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.nextPage();
        event.preventDefault(); // Prevent tabbing to next element
      }
    } else if (event.key === 'Escape') {
      this.resultPresenterService.currentResultIndex$.next(undefined);
      event.preventDefault();
    } else if (event.code === 'Space') {
      if (!this.isInputFocusedSubject.value) {
        if (this.resultPresenterService.currentResultIndex$.value === undefined) {
          this.resultPresenterService.currentResultIndex$.next(0);
        } else {
          this.resultPresenterService.currentResultIndex$.next(undefined);
        }
        event.preventDefault();
      }
    } else if (event.key === 'q') { // select
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.selectQuery$.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'e') { // focus
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.focusQuery$.next(true);
        event.preventDefault();
      } else if (event.ctrlKey) {
        this.resultPresenterService.focusQuery$.next(false);
        event.preventDefault();
      }
    } else if (event.key === 'x') { // clear
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.resetQuery$.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'h') { // history
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.showHistory$.next(!this.resultPresenterService.showHistory$.value);
        event.preventDefault();
      }
    } else if (event.key === 'i') { // help
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.showHelp$.next(!this.resultPresenterService.showHelp$.value);
        event.preventDefault();
      }
    } else if (event.key === 't') { // tuning
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.showTuning$.next(!this.resultPresenterService.showTuning$.value);
        event.preventDefault();
      }
    } else if (event.key === 'm') { // query mode
      if (!this.isInputFocusedSubject.value) {
        this.settingsService.setSearchAreaMode(this.settingsService.getSearchAreaMode() === ExpSearchAreaMode.TEXT ? ExpSearchAreaMode.GRAPHICAL : ExpSearchAreaMode.TEXT);
        event.preventDefault();
      }
    } else if (event.key === 'r' && !event.metaKey) { // result mode
      if (!this.isInputFocusedSubject.value) {
        this.settingsService.setResultMode(this.settingsService.getResultMode() === SearchResultMode.DEFAULT ? SearchResultMode.MINIMAL : SearchResultMode.DEFAULT);
        event.preventDefault();
      }
    } else if (event.key === 's') { // submit
      if (!this.isInputFocusedSubject.value) {

      }
      // TODO: implement submit
    } else {
      if (!this.isInputFocusedSubject.value) {
        switch (event.key) { // go to page from 1 to 10 (0 is 10)
          case '0':
            this.resultPresenterService.currentPage$.next(10);
            break;
          default:
            const keyNumber = parseInt(event.key);
            if (!isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= 9) {
              this.resultPresenterService.currentPage$.next(keyNumber);
            }
            break;
        }
      }
    }
  }
}
