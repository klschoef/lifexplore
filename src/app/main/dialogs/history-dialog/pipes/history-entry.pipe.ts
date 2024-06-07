import { Pipe, PipeTransform } from '@angular/core';
import {HistoryEntryToText} from '../../../utils/transformers/history-entry-to-text';
import {SettingsService} from '../../../services/settings.service';

@Pipe({
  name: 'historyEntry'
})
export class HistoryEntryPipe implements PipeTransform {

  transform(value: any): string {
    return HistoryEntryToText.transform(value, this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.textCommandPrefix ?? '-');
  }

  constructor(
    private settingsService: SettingsService
  ) {
  }
}
