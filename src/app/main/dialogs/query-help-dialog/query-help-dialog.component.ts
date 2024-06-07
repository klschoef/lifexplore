import {Component, EventEmitter, Output} from '@angular/core';
import {map} from 'rxjs/operators';
import {SettingsService} from '../../services/settings.service';
import {filter} from 'rxjs';

@Component({
  selector: 'lx-query-help-dialog',
  templateUrl: './query-help-dialog.component.html',
  styleUrls: ['./query-help-dialog.component.scss']
})
export class QueryHelpDialogComponent {
  @Output() clickOnClose: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  textCommandPrefix$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_QUERY_SETTINGS]?.textCommandPrefix ?? '-'),
    filter((res) => res !== undefined),
  );

  constructor(private settingsService: SettingsService) {
  }
}
