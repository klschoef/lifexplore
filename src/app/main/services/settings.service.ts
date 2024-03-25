import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  static LOCAL_STORAGE_SETTINGS = 'settings';
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
}
