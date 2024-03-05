import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'lx-query-help-dialog',
  templateUrl: './query-help-dialog.component.html',
  styleUrls: ['./query-help-dialog.component.scss']
})
export class QueryHelpDialogComponent {
  @Output() clickOnClose: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
}
