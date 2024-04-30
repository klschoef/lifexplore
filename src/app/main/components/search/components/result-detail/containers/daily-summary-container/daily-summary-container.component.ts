import {Component, Input, OnInit} from '@angular/core';
import ObjectQuery from '../../../../../../models/object-query';
import {WSServerStatus} from '../../../../../../../global-constants';
import URLUtil from '../../../../../../utils/url-util';
import {PythonServerService} from '../../../../../../services/pythonserver.service';
import {filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-daily-summary-container',
  templateUrl: './daily-summary-container.component.html',
  styleUrls: ['./daily-summary-container.component.scss']
})
export class DailySummaryContainerComponent implements OnInit {
  @Input() result: any;
  pageSize = 2000;
  currentPage = 1;
  totalResults = 0;
  totalPages = 0;
  pages: number[] = [];
  requestId?: string;
  results$ = this.pythonServerService.receivedMessages.pipe(
    filter((msg) => msg && msg.results && msg.results.length > 0 && !msg.type && msg.requestId === this.requestId),
    tap((msg) => {
      this.totalResults = msg.totalresults ?? 0;
      this.totalPages = Math.ceil(this.totalResults / this.pageSize);

      // Calculate start and end page numbers
      const startPage = Math.max(this.currentPage - 3, 1);
      const endPage = Math.min(this.currentPage + 3, this.totalPages);

      // Generate the array of page numbers
      this.pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
    }),
    // add the base URL to the filepath, and return just the results
    map((msg) => msg.results.map((result: any) => ({...result, originalFilepath: result.filepath, filepath: URLUtil.getKeyframeBaseUrl()+result.filepath}))),
  );

  constructor(
    private pythonServerService: PythonServerService,
  ) {
  }

  ngOnInit() {
    console.log('result', this.result);
    this.performDailyQuery();
  }

  performDailyQuery() {
    if (this.pythonServerService.connectionState === WSServerStatus.CONNECTED) {

      // generate new request id
      this.requestId = Math.random().toString(36).substring(7);

      let msg = {
        type: "textquery",
        version: 2,
        clientId: "direct",
        query_dicts: [
          {
            day: this.result.day,
            month: this.result.month,
            year: this.result.year,
          }
        ],
        maxresults: 2000,
        resultsperpage: this.pageSize,
        selectedpage: this.currentPage,
        // random request id
        requestId: this.requestId
      };

      this.pythonServerService.sendMessage(msg);
    }
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.performDailyQuery();
  }
}
