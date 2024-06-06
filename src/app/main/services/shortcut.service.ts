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
  public lockEnter = new BehaviorSubject<boolean>(false);
  public isLockedEnterPressed = new BehaviorSubject<boolean>(false);
  public isEnterPressed = new BehaviorSubject<boolean>(false);
  public shiftKeyIsPressedSubject = new BehaviorSubject<boolean>(false);
  public isSPressed = new BehaviorSubject(false);
  public isFPressed = new BehaviorSubject(false);
  public isGPressed = new BehaviorSubject(false);
  public isSAndShiftIsPressed = new BehaviorSubject(false);
  public isFAndShiftIsPressed = new BehaviorSubject(false);
  public isRAndShiftIsPressed = new BehaviorSubject(false);
  public isZPressed = new BehaviorSubject(false);
  public isDPressed = new BehaviorSubject(false);
  public isDAndShiftPressed = new BehaviorSubject(false);
  public isOPressed = new BehaviorSubject(false);
  public isArrowLeftPressed = new BehaviorSubject(false);
  public isArrowRightPressed = new BehaviorSubject(false);
  public isEscapePressed = new BehaviorSubject(false);
  public isSpacePressed = new BehaviorSubject(false);
  public isTabPressed = new BehaviorSubject(false);
  public isTabShiftPressed = new BehaviorSubject(false);
  public isNumberPressed = new BehaviorSubject<number | undefined>(undefined);

  constructor(
    private resultPresenterService: ResultPresenterService,
    private settingsService: SettingsService
  ) {
    this.isGPressed.subscribe((value) => {
      if (value) {
        this.settingsService.saveQuerySettings({
          ...this.settingsService.getQuerySettings(),
          useGPTasDefault: !(this.settingsService.getQuerySettings().useGPTasDefault ?? false)
        })
      }
    });
  }

  handleKeyboardEventUp(event: KeyboardEvent) {
    //console.log("event up", event);
    this.shiftKeyIsPressedSubject.next(event.shiftKey);
    this.isNumberPressed.next(undefined);

    if (event.key === 's') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isSAndShiftIsPressed.next(false);
        this.isSPressed.next(false);
        event.preventDefault();
      }
    } else if (event.key === 'z') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isZPressed.next(false);
        event.preventDefault();
      }
    } else if (event.key === 'f') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isFPressed.next(false);
        event.preventDefault();
      }
    } else if (event.key === 'g') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isGPressed.next(false);
        event.preventDefault();
      }
    } else if (event.key === 'd') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isDPressed.next(false);
        event.preventDefault();
      }
    } else if (event.key === 'o') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isOPressed.next(false);
        event.preventDefault();
      }
    } else if(event.key === 'ArrowLeft' && !this.isInputFocusedSubject.value) {
      this.isArrowLeftPressed.next(false);
    } else if(event.key === 'ArrowRight' && !this.isInputFocusedSubject.value) {
      this.isArrowRightPressed.next(false);
    } else if(event.key === 'Escape' && !this.isInputFocusedSubject.value) {
      this.isEscapePressed.next(false);
    } else if(event.code === 'Space' && !this.isInputFocusedSubject.value) {
      this.isSpacePressed.next(false);
    } else if(event.code === 'Tab' && !this.isInputFocusedSubject.value) {
      this.isTabPressed.next(false);
    } else if (event.code === 'Tab' && event.shiftKey) {
      this.isTabShiftPressed.next(false);
    } else if (event.code === 'Enter') {
      this.isLockedEnterPressed.next(false);
      this.isEnterPressed.next(false);
    }
  }

  handleKeyboardEvent(event: KeyboardEvent) {
    //console.log("event", event);
    this.shiftKeyIsPressedSubject.next(event.shiftKey);

    if (event.key === 'ArrowLeft') {
      if (!this.isInputFocusedSubject.value) {
        //this.resultPresenterService.previousResult();
        this.isArrowLeftPressed.next(true);
      }
    } else if (event.key === 'ArrowRight') {
      if (!this.isInputFocusedSubject.value) {
        //this.resultPresenterService.nextResult();
        this.isArrowRightPressed.next(true);
      }
    } else if (event.key === 'Enter' /*&& event.shiftKey*/) {
      if (!this.lockEnter.value) {
        this.resultPresenterService.triggerSearch$.next(true);
        this.isEnterPressed.next(true);
      } else {
        this.isLockedEnterPressed.next(true);
      }
      //this.resultPresenterService.search$.next(true);
    } else if (event.key === 'Tab' && event.shiftKey) {
      this.isTabShiftPressed.next(true);
      //this.resultPresenterService.previousPage();
      event.preventDefault(); // Prevent tabbing to previous element
    } else if (event.key === 'Tab' && !event.shiftKey) {
      if (!this.isInputFocusedSubject.value) {
        //this.resultPresenterService.nextPage();
        this.isTabPressed.next(true);
        event.preventDefault(); // Prevent tabbing to next element
      }
    } else if (event.key === 'Escape') {
      //this.resultPresenterService.currentResultIndex$.next(undefined);
      this.isEscapePressed.next(true);
      event.preventDefault();
    } else if (event.code === 'Space') {
      if (!this.isInputFocusedSubject.value) {
        /*if (this.resultPresenterService.currentResultIndex$.value === undefined) {
          this.resultPresenterService.currentResultIndex$.next(0);
        } else {
          this.resultPresenterService.currentResultIndex$.next(undefined);
        }*/
        this.isSpacePressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'q') { // select
      if (!this.isInputFocusedSubject.value) {
        this.resultPresenterService.selectQuery$.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'f') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isFPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'g') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isGPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 's') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isSPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'S') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isSAndShiftIsPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'F') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isFAndShiftIsPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'R') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isRAndShiftIsPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'D') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isDAndShiftPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'z') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isZPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'd') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isDPressed.next(true);
        event.preventDefault();
      }
    } else if (event.key === 'o') { // submit
      if (!this.isInputFocusedSubject.value) {
        this.isOPressed.next(true);
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
    } else {
      if (!this.isInputFocusedSubject.value) {
        switch (event.key) { // go to page from 1 to 10 (0 is 10)
          case '0':
            this.isNumberPressed.next(10);
            this.resultPresenterService.currentPage$.next(10);
            break;
          default:
            const keyNumber = parseInt(event.key);
            if (!isNaN(keyNumber) && keyNumber >= 1 && keyNumber <= 9) {
              //this.resultPresenterService.currentPage$.next(keyNumber);
              this.isNumberPressed.next(keyNumber);
            }
            break;
        }
      }
    }
  }
}
