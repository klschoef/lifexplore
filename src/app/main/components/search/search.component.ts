import { Component } from '@angular/core';
import {getTimestampInSeconds, WSServerStatus} from '../../../global-constants';
import URLUtil from '../../utils/url-util';
import {VBSServerConnectionService} from '../../services/vbsserver-connection.service';
import {NodeServerConnectionService} from '../../services/nodeserver-connection.service';
import {ClipServerConnectionService} from '../../services/clipserver-connection.service';
import {ActivatedRoute, Router} from '@angular/router';
import {InteractionLogService} from '../../services/interaction-log.service';
import {QueryEventLogService} from '../../services/query-event-log.service';
import {QueryResultLogService} from '../../services/query-result-log.service';
import {HistoryService} from '../../services/history.service';
import {ExpLogService} from '../../services/exp-log.service';
import {filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  results$ = this.nodeService.messages.pipe(
    filter((msg) => msg && msg.results && msg.results.length > 0),
    // add the base URL to the filepath, and return just the results
    map((msg) => msg.results.map((result: any) => ({...result, filepath: URLUtil.getKeyframeBaseUrl()+result.filepath}))),
    tap((msg) => console.log("Results from HERE: ", msg))
  );

  queryModes = [
    {id: 'all', name: 'All Images'},
    {id: 'distinctive', name: 'Less Duplicates'},
    {id: 'moredistinctive', name: 'Distinctive Images'},
    {id: 'first', name: 'First Image/Day'}
  ];

  constructor(
    public nodeService: NodeServerConnectionService,
    public clipService: ClipServerConnectionService,
    private route: ActivatedRoute,
    private router: Router,
    private interactionLogService: InteractionLogService,
    private queryEventLogService: QueryEventLogService,
    private queryResultLogService: QueryResultLogService,
    private historyService: HistoryService,
    private expLogService: ExpLogService) {
  }

  searchValueChange(value: string): void {
    console.log(value);
  }

  onSearch(value: string): void {
    console.log("Search", value);
    this.performTextQuery(value);
  }

  performTextQuery(value: string): void {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {

      const queryBaseURL = URLUtil.getBaseURL();
      let msg = {
        type: "textquery",
        version: 2,
        clientId: "direct",
        query: value,
        maxresults: 2000,
        resultsperpage: 50,
        selectedpage: 1,
        queryMode: this.queryModes[0]
      };

      this.nodeService.sendToNodeServer(msg);

      //this.historyService.saveToHistory(msg);

      //query logging
      this.queryEventLogService.logJointEmbedding(value);

      //interaction logging
      // this.interactionLogService.logTextQuery(this.queryinput, this.selectedPage);

    } else {
      console.log(`CLIP or NODE connection down: ${this.clipService.connectionState} ${this.nodeService.connectionState}.`);
    }
  }
}
