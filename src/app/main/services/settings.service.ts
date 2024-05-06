import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  static LOCAL_STORAGE_SETTINGS = 'settings';
  static LOCAL_QUERY_SETTINGS = 'querySettings';
  settings$ = new BehaviorSubject<any>({});

  constructor() {
    this.loadSettings();
  }

  setSettings(settings: any) {
    this.settings$.next(settings);
    this.saveSettings();
  }

  saveSettings() {
    localStorage.setItem(SettingsService.LOCAL_STORAGE_SETTINGS, JSON.stringify(this.settings$.value));
  }

  deleteSettings() {
    localStorage.removeItem(SettingsService.LOCAL_STORAGE_SETTINGS);
    this.settings$.next({});
  }

  loadSettings() {
    this.settings$.next(JSON.parse(localStorage.getItem(SettingsService.LOCAL_STORAGE_SETTINGS) ?? "{}"))
  }

  getQuerySettings() {
    return this.settings$.getValue()[SettingsService.LOCAL_QUERY_SETTINGS];
  }

  saveQuerySettings(querySettings: any) {
    this.setSettings({
      ...this.settings$.getValue(),
      querySettings: querySettings
    });
  }
}
