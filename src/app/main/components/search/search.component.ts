import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {getTimestampInSeconds, WSServerStatus} from '../../../shared/config/global-constants';
import URLUtil from '../../utils/url-util';
import {ClipServerConnectionService} from '../../services/clipserver-connection.service';
import {ActivatedRoute, Router} from '@angular/router';
import {InteractionLogService} from '../../services/interaction-log.service';
import {QueryEventLogService} from '../../services/query-event-log.service';
import {QueryResultLogService} from '../../services/query-result-log.service';
import {HistoryService} from '../../services/history.service';
import {ExpLogService} from '../../services/exp-log.service';
import {BehaviorSubject, filter, Subject, takeUntil, tap} from 'rxjs';
import {map, skip} from 'rxjs/operators';
import ObjectQuery from '../../models/object-query';
import {SearchResultMode} from '../settings/components/settings-view-results-mode/settings-view-results-mode.component';
import {SettingsService} from '../../services/settings.service';
import {PythonServerService} from '../../services/pythonserver.service';
import {ResultPresenterService} from '../../services/result-presenter.service';
import {ExpSearchAreaMode} from '../exp-search-area/exp-search-area.component';
import {ShortcutService} from '../../services/shortcut.service';
import {QueryEventCategory} from '../../../../../openapi/dres';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {

  totalResults = 0;
  currentPage = 1;
  totalPages = 0;
  pages: number[] = [];
  progress$ = new BehaviorSubject<string | undefined>(undefined)
  error$ = new BehaviorSubject<string | undefined>(undefined)
  requestId?: string;

  previousPageTrigger$ = new BehaviorSubject(undefined);
  nextPageTrigger$ = new BehaviorSubject(undefined);
  openPageTrigger$ = new BehaviorSubject<number | undefined>(undefined);
  destroy$ = new Subject<void>();
  groupSize?: number;

  results$ = this.pythonServerService.receivedMessages.pipe(
    tap(msg => {
      console.log("server message: ", msg);
      this.progress$.next((msg && msg.type && msg.type === 'progress') ? msg.message : undefined);
      this.error$.next((msg && msg.type && msg.type === 'error') ? msg.error : undefined);
    }),
    filter((msg) => msg && msg.results && !msg.type && msg.requestId === this.requestId),
    tap((msg) => {
      this.groupSize = msg.group_size;
      this.totalResults = msg.totalresults ?? 0;
      this.totalPages = Math.ceil(this.totalResults / (this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.resultsperpage ?? 50));

      this.resultPresenterService.maxPages$.next(this.totalPages);
      this.resultPresenterService.maxResultsForCurrentPage$.next(msg.num ?? 0);

      // Calculate start and end page numbers
      const startPage = Math.max(this.currentPage - 3, 1);
      const endPage = Math.min(this.currentPage + 3, this.totalPages);

      // Generate the array of page numbers
      this.pages = Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i);
    }),
    // add the base URL to the filepath, and return just the results
    map((msg) => msg.results.map((result: any) => ({...result, originalFilepath: result.filepath,
      filepath: URLUtil.getKeyframeBaseUrl()+result.filepath,
      thumbsFilepath: URLUtil.getKeyframeThumbsBaseUrl()+result.filepath
    }))),
    tap((msg) => console.log("New results: ", msg))
  );

  openSettings$ = new BehaviorSubject<boolean>(false);
  HTMLSearchResultMode = SearchResultMode;

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

    this.previousPageTrigger$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = Math.max(this.currentPage - 1, 1);
      this.loadPage(this.currentPage);
    });

    this.nextPageTrigger$.pipe(
      skip(1),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.currentPage = Math.min(this.currentPage + 1, this.totalPages);
      this.loadPage(this.currentPage);
    });

    this.openPageTrigger$.pipe(
      filter(page => page !== undefined),
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      if (page) {
        this.currentPage = page;
        this.loadPage(this.currentPage);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.currentPage = 1;
    this.performTextQuery(value, []);
  }

  onSearchObject(value: ObjectQuery[]): void {
    this.currentPage = 1;
    this.performTextQuery("", value);
  }

  loadPage(page: number) {
    this.currentPage = page;
    this.performTextQuery(this.lastValue, this.lastObjectValue, true);
  }

  performTextQuery(value?: string, objectValues?: ObjectQuery[], pageSwitch=false): void {
    if (this.pythonServerService.connectionState === WSServerStatus.CONNECTED) {
      this.requestId = Math.random().toString(36).substring(7);
      const queryBaseURL = URLUtil.getBaseURL();

      const querySettings = this.settingsService.getQuerySettings();

      let msg = {
        type: "textquery",
        version: 2,
        clientId: "direct",
        textCommandPrefix: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.textCommandPrefix ?? '-',
        query: value,
        useGPTasDefault: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.useGPTasDefault,
        temporalPrefetchMode: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.temporalPrefetchMode ?? true,
        temporalDBPrefetchPageSize: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.temporalDBPrefetchPageSize ?? 5000,
        query_dicts: objectValues,
        maxresults: 2000,
        resultsperpage: this.settingsService.settings$.value[SettingsService.LOCAL_QUERY_SETTINGS]?.resultsperpage ?? 50,
        selectedpage: this.currentPage.toString(),
        queryMode: this.queryModes[0].name,
        requestId: this.requestId,
        ...querySettings
      };

      this.lastValue = value;
      this.lastObjectValue = objectValues;

      if (!pageSwitch) {
        this.historyService.saveToHistory(msg);
      }

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
