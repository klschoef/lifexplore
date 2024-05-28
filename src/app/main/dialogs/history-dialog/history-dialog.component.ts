import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {HistoryService} from '../../services/history.service';
import {BehaviorSubject} from 'rxjs';
import {HistoryEntryPipe} from './pipes/history-entry.pipe';
import {HistoryEntryToText} from '../../utils/transformers/history-entry-to-text';

@Component({
  selector: 'lx-history-dialog',
  templateUrl: './history-dialog.component.html',
  styleUrls: ['./history-dialog.component.scss']
})
export class HistoryDialogComponent implements OnInit {
  @Output() clickOnClose: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();
  @Output() clickOnHistoryItem: EventEmitter<any> = new EventEmitter<any>();

  searchValue: string = '';
  historyList$: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(
    public historyService: HistoryService
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    console.log('loadHistory');
    const historyObjectList: any[] = JSON.parse(this.historyService.fetch_raw_history_object() ?? '[]');
    // TODO: add support for query_dicts
    this.historyList$.next(
      historyObjectList.filter(item =>
        HistoryEntryToText.transform(item).toLowerCase().includes(this.searchValue.toLowerCase())
      )
    );
  }
}
