import {Component, HostListener, OnInit} from '@angular/core';
import {getTimestampInSeconds, WSServerStatus} from '../../../shared/config/global-constants';
import URLUtil from '../../utils/url-util';
import {ClipServerConnectionService} from '../../services/clipserver-connection.service';
import {ActivatedRoute, Router} from '@angular/router';
import {InteractionLogService} from '../../services/interaction-log.service';
import {QueryEventLogService} from '../../services/query-event-log.service';
import {QueryResultLogService} from '../../services/query-result-log.service';
import {HistoryService} from '../../services/history.service';
import {ExpLogService} from '../../services/exp-log.service';
import {BehaviorSubject, filter, tap} from 'rxjs';
import {map} from 'rxjs/operators';
import ObjectQuery from '../../models/object-query';
import {SearchResultMode} from '../settings/components/settings-view-results-mode/settings-view-results-mode.component';
import {SettingsService} from '../../services/settings.service';
import {PythonServerService} from '../../services/pythonserver.service';
import {ResultPresenterService} from '../../services/result-presenter.service';
import {ExpSearchAreaMode} from '../exp-search-area/exp-search-area.component';
import {ShortcutService} from '../../services/shortcut.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  totalResults = 0;
  currentPage = 1;
  totalPages = 0;
  pages: number[] = [];
  progress$ = new BehaviorSubject<string | undefined>(undefined)
  error$ = new BehaviorSubject<string | undefined>(undefined)
  requestId?: string;

  results$ = this.pythonServerService.receivedMessages.pipe(
    tap(msg => {
      console.log("message here", msg);
      this.progress$.next((msg && msg.type && msg.type === 'progress') ? msg.message : undefined);
      this.error$.next((msg && msg.type && msg.type === 'error') ? msg.error : undefined);
    }),
    filter((msg) => msg && msg.results && !msg.type && msg.requestId === this.requestId),
    tap((msg) => {
      this.totalResults = msg.totalresults ?? 0;
      this.totalPages = Math.ceil(this.totalResults / this.pageSize);

      this.resultPresenterService.maxPages$.next(this.totalPages);
      this.resultPresenterService.maxResultsForCurrentPage$.next(msg.num ?? 0);

      // Calculate start and end page numbers
      const startPage = Math.max(this.currentPage - 3, 1);
      const endPage = Math.min(this.currentPage + 3, this.totalPages);

      // Generate the array of page numbers
      this.pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
    }),
    // add the base URL to the filepath, and return just the results
    map((msg) => msg.results.map((result: any) => ({...result, originalFilepath: result.filepath, filepath: URLUtil.getKeyframeBaseUrl()+result.filepath}))),
    tap((msg) => console.log("Results from HERE: ", msg))
  );

  openSettings$ = new BehaviorSubject<boolean>(false);
  HTMLSearchResultMode = SearchResultMode;
  pageSize = this.settingsService.settings$.getValue().pageSize ?? 50

  // last values
  lastValue?: string;
  lastObjectValue?: ObjectQuery[];

  searchResultMode$ = this.settingsService.settings$.pipe(
    map((settings) => settings.searchResultMode ?? SearchResultMode.DEFAULT),
  );

  queryModes = [
    {id: 'all', name: 'All Images'},
    {id: 'distinctive', name: 'Less Duplicates'},
    {id: 'moredistinctive', name: 'Distinctive Images'},
    {id: 'first', name: 'First Image/Day'}
  ];

  constructor(
    public pythonServerService: PythonServerService,
    public clipService: ClipServerConnectionService,
    private route: ActivatedRoute,
    private router: Router,
    private interactionLogService: InteractionLogService,
    private queryEventLogService: QueryEventLogService,
    private settingsService: SettingsService,
    private queryResultLogService: QueryResultLogService,
    private historyService: HistoryService,
    private expLogService: ExpLogService,
    private resultPresenterService: ResultPresenterService,
    private shortcutService: ShortcutService
  ) {
  }

  ngOnInit() {
    this.resultPresenterService.currentPage$.subscribe((page) => {
      if (page && page !== this.currentPage) {
        this.currentPage = page ?? 1;
        this.loadPage(this.currentPage);
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.shortcutService.handleKeyboardEvent(event);
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEventUp(event: KeyboardEvent) {
    this.shortcutService.handleKeyboardEventUp(event);
  }

  searchValueChange(value: string): void {
    console.log(value);
  }

  onSearch(value: string): void {
    this.performTextQuery(value, []);
  }

  onSearchObject(value: ObjectQuery[]): void {
    this.performTextQuery("", value);
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.performTextQuery(this.lastValue, this.lastObjectValue);
  }

  performTextQuery(value?: string, objectValues?: ObjectQuery[]): void {
    if (this.pythonServerService.connectionState === WSServerStatus.CONNECTED) {

      this.requestId = Math.random().toString(36).substring(7);
      const queryBaseURL = URLUtil.getBaseURL();

      const querySettings = this.settingsService.getQuerySettings();

      let msg = {
        type: "textquery",
        version: 2,
        clientId: "direct",
        query: value,
        query_dicts: objectValues,
        maxresults: 2000,
        resultsperpage: this.pageSize,
        selectedpage: this.currentPage.toString(),
        queryMode: this.queryModes[0].name,
        requestId: this.requestId,
        ...querySettings
      };

      this.lastValue = value;
      this.lastObjectValue = objectValues;

      this.historyService.saveToHistory(msg);
      this.pythonServerService.sendMessage(msg);

      //this.historyService.saveToHistory(msg);

      //query logging
      this.queryEventLogService.logJointEmbedding(value ?? "");

      //interaction logging
      // this.interactionLogService.logTextQuery(this.queryinput, this.selectedPage);

    } else {
      console.log(`CLIP or NODE connection down: ${this.clipService.connectionState} ${this.pythonServerService.connectionState}.`);
    }
  }

  protected readonly WSServerStatus = WSServerStatus;
}
