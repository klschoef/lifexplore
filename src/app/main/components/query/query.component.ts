import {ViewChild, ElementRef, Component, AfterViewInit, OnInit, OnDestroy} from '@angular/core';
import { HostListener } from '@angular/core';
import { GlobalConstants, WSServerStatus, QueryType, getTimestampInSeconds } from '../../../global-constants';
import { VBSServerConnectionService } from '../../services/vbsserver-connection.service';
import { NodeServerConnectionService } from '../../services/nodeserver-connection.service';
import { ClipServerConnectionService } from '../../services/clipserver-connection.service';
import { Router,ActivatedRoute } from '@angular/router';
import { QueryResult} from 'openapi/dres';
import { LocalConfig } from '../../../local-config';
import {JsonObjects} from '../../models/json/json-objects';
import {JsonConcepts} from '../../models/json/json-concepts';
import {JsonTexts} from '../../models/json/json-texts';
import {ExpLogService} from '../../services/exp-log.service';
import {InteractionLogService} from '../../services/interaction-log.service';
import {QueryEventLogService} from '../../services/query-event-log.service';
import {QueryResultLogService} from '../../services/query-result-log.service';

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class QueryComponent implements AfterViewInit, OnInit {

  @ViewChild('inputfield') inputfield!: ElementRef<HTMLInputElement>;
  @ViewChild('historyDiv') historyDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('videopreview') videopreview!: ElementRef<HTMLDivElement>;

  localConfig = LocalConfig;

  // File similarity params
  file_sim_keyframe: string | undefined
  file_sim_pathPrefix: string | undefined

  // inputs
  queryinput: string = '';
  topicanswer: string = '';

  // results
  queryresults: Array<string> = [];
  resultURLs: Array<string> = [];
  queryresult_serveridx: Array<number> = [];
  queryresult_resultnumber: Array<string> = [];
  queryresult_videoid: Array<string> = [];
  queryresult_frame: Array<string> = [];
  queryresult_videopreview: Array<string> = [];

  queryTimestamp: number = 0;
  queryType: string = '';
  metadata: any;

  public statusTaskInfoText: string = ""; //property binding
  statusTaskRemainingTime: string = ""; //property binding

  nodeServerInfo?: string; // info message for server communication

  videopreviewimage: string = '';

  showFullImage: boolean = false;
  showHelpActive: boolean = false;
  fullImage: string = '';
  fullImageIndex: number = -1;

  previousQuery : any | undefined;

  querydataset: string = '';
  queryBaseURL = this.getBaseURL();

  maxresults = LocalConfig.config_MAX_RESULTS_TO_RETURN;
  totalReturnedResults = 0; //how many results did our query return in total?
  resultsPerPage = LocalConfig.config_RESULTS_PER_PAGE;
  MAX_RESULTS_TO_DISPLAY = GlobalConstants.MAX_RESULTS_TO_DISPLAY;
  selectedPage = '1'; //user-selected page
  pages = ['1']

  thumbSize = 'small';
  queryMode = 'all';
  selectedHistoryEntry: string | undefined
  selectedServerRun: string | undefined
  queryFieldHasFocus = false;
  answerFieldHasFocus = false;
  showButtons = -1;
  queryModes = [
    {id: 'all', name: 'All Images'},
    {id: 'distinctive', name: 'Less Duplicates'},
    {id: 'moredistinctive', name: 'Distinctive Images'},
    {id: 'first', name: 'First Image/Day'}
  ];

  constructor(
    public vbsService: VBSServerConnectionService,
    public nodeService: NodeServerConnectionService,
    public clipService: ClipServerConnectionService,
    private route: ActivatedRoute,
    private router: Router,
    private interactionLogService: InteractionLogService,
    private queryEventLogService: QueryEventLogService,
    private queryResultLogService: QueryResultLogService,
    private expLogService: ExpLogService) {
  }


  ngOnInit() {
    console.log('query component (qc) initated');

    //read parameters
    this.route.params.subscribe(params => {
      if ('filename' in params) {
        let paramFilename = params['filename'];
        this.queryinput = '-fn ' + paramFilename;
        setTimeout(() => { // TODO: why the timeout is needed?
          this.performQuery();
        }, 250);
      }
      else if ('objects' in params) {
        let paramObject = params['objects'];
        this.queryinput = '-o ' + paramObject;
        setTimeout(() => {
          this.performQuery();
        }, 250);
      }
      else if ('places' in params) {
        let paramPlace = params['places'];
        this.queryinput = '-p ' + paramPlace;
        setTimeout(() => {
          this.performQuery();
        }, 250);
      }
      else if ('concepts' in params) {
        let paramConcept = params['concepts'];
        this.queryinput = '-c ' + paramConcept;
        setTimeout(() => {
          this.performQuery();
        }, 250);
      }
      else if ('texts' in params) {
        let paramText = params['texts'];
        this.queryinput = '-t ' + paramText;
        setTimeout(() => {
          this.performQuery();
        }, 250);
      }
      else if ('similarto' in params) {
        let filepath = params['similarto'];
        //this.queryinput = '-sim ' + filepath;
        setTimeout(() => {
          //this.performQuery();
          this.performFileSimilarityQuery(filepath, '');
        }, 250);
      }
    });

    //already connected?
    if (this.nodeService.connectionState == WSServerStatus.CONNECTED) {
      console.log('qc: node-service already connected');
    } else {
      console.log('qc: node-service not connected yet');
    }
    if (this.clipService.connectionState == WSServerStatus.CONNECTED) {
      console.log('qc: CLIP-service already connected');
      if (this.file_sim_keyframe && this.file_sim_pathPrefix) {
        this.performFileSimilarityQuery(this.file_sim_keyframe, this.file_sim_pathPrefix);
      } else {
        this.performHistoryLastQuery();
      }
    } else {
      console.log('qc: CLIP-service not connected yet');
    }

    this.nodeService.messages.subscribe(msg => {
      this.nodeServerInfo = undefined;

      if ('wsstatus' in msg) {
        console.log('qc: node-notification: connected');
      } else {
        //let result = msg.content;
        console.log("qc: response from node-server: " + msg);
        if ("scores" in msg) {
          this.handleQueryResponseMessage(msg);
        } else {
          if ("type" in msg) {
            let m = JSON.parse(JSON.stringify(msg));
            if (m.type == 'metadata') {
              this.metadata = m.results[0];
              console.log('received metadata: ' + JSON.stringify(msg));
              if (this.metadata?.location) {
              }
            } else if (m.type === 'info'){
              console.log(m.message);
              this.nodeServerInfo = m.message;
            } else if (m.type === 'objects') {
              console.log(m);
            }
          } else {
            //this.handleNodeMessage(msg);
            this.handleQueryResponseMessage(msg);
          }
        }
      }
    });

    this.clipService.messages.subscribe(msg => {
      if ('wsstatus' in msg) {
        console.log('qc: CLIP-notification: connected');
        if (this.file_sim_keyframe && this.file_sim_pathPrefix) {
          this.performFileSimilarityQuery(this.file_sim_keyframe, this.file_sim_pathPrefix);
        }
      } else {
        console.log("qc: response from clip-server: " + msg);
        this.handleQueryResponseMessage(msg);
      }
    });

    //repeatedly retrieve task info
    setInterval(() => {
      this.requestTaskInfo();
    }, 1000);

  }

  ngAfterViewInit(): void {
    this.historyDiv.nativeElement.hidden = true;
  }

  requestTaskInfo() {
    this.vbsService.getClientTaskInfo(this.vbsService.serverRunIDs[0], this);
  }

  displayFullImage(url: string, index: number) {
    this.fullImage = url;
    this.fullImageIndex = index;
    this.performMetaDataQuery();
    this.showFullImage = true;

    //interaction logging
    this.interactionLogService.logFullImageDisplay(index, url);
  }

  hideFullImage() {
    //interaction logging
    this.interactionLogService.logFullImageHide(this.fullImageIndex, this.fullImage);

    this.showFullImage = false;
    this.fullImage = '';
    this.fullImageIndex = -1;
  }

  toggleHistorySelect() {
    this.historyDiv.nativeElement.hidden = !this.historyDiv.nativeElement.hidden;
    /*if (!this.historyDiv.nativeElement.hidden) {
      this.historyDiv.nativeElement.focus();
    }*/
  }

  showHelp() {
    this.showHelpActive = !this.showHelpActive;
    if (this.showHelpActive) {
      //interaction logging
      this.interactionLogService.logShowHelp(this.selectedPage, this.queryresults);
    }
  }

  // TODO: move to service (maybe log service?)
  history() {
    let historyList = [];
    let hist = localStorage.getItem('history')
    if (hist) {
      let histj:[QueryType] = JSON.parse(hist);
      for (let i=0; i < histj.length; i++) {
        let ho = histj[i];
        historyList.push(`${ho.type}: ${ho.query} (${ho.queryMode})`)
      }
    }
    return historyList; //JSON.parse(hist!);
  }

  // TODO: move to same service then history
  saveToHistory(msg: QueryType) {
    if (msg.query === '') {
      return;
    }

    let hist = localStorage.getItem('history')
    if (hist) {
      let queryHistory:Array<QueryType> = JSON.parse(hist);
      let containedPos = -1;
      let i = 0;
      for (let qh of queryHistory) {
        if (qh.query === msg.query && qh.queryMode === msg.queryMode) {
          containedPos = i;
          break;
        }
        i++;
      }
      if (containedPos >= 0) {
        queryHistory.splice(containedPos,1);
        queryHistory.unshift(msg);
        localStorage.setItem('history', JSON.stringify(queryHistory));
      }
      else {
        queryHistory.unshift(msg);
        localStorage.setItem('history', JSON.stringify(queryHistory));
      }
    } else {
      let queryHistory:Array<QueryType> = [msg];
      localStorage.setItem('history', JSON.stringify(queryHistory));
    }
  }

  // TODO: move to utils
  filenameToDate(fn:string):string {
    let yyyy = fn.substring(0,4);
    let MM = fn.substring(4,6);
    let dd = fn.substring(6,8);
    let hh = fn.substring(9,11);
    let mm = fn.substring(11,13);
    let ss = fn.substring(13,15);

    return dd + '.' + MM + '.' + yyyy + ' ' + hh + ':' + mm + ':' + ss;
  }

  // TODO: move to utils
  asTimeLabel(frame:string, withFrames:boolean=true) {
    console.log('TODO: need FPS in query component!')
    return frame;
    //return formatAsTime(frame, this.fps, withFrames);
  }

  // TODO: move to utils
  getDetectedObjects(jsonObjects: JsonObjects[]): string {
    const objectNames: string[] = jsonObjects.map((obj) => obj.object);
    return objectNames.join(', ');
  }

  // TODO: move to query utils?
  addToQuery(prefix:string, name:string) {
    if (this.queryinput.includes('-' + prefix + ' ')) {
      this.queryinput = this.queryinput.replace('-' + prefix + ' ', '-' + prefix + ' ' + name + ',');
    } else {
      this.queryinput = '-' + prefix + ' ' + name + ' ' + this.queryinput;
    }
  }

  // TODO: move to query utils?
  delFromQuery(prefix:string, name:string) {
    if (this.queryinput.includes('-' + prefix + ' ')) {
      if (this.queryinput.indexOf('-' + prefix + ' ' + name + ' ') >= 0) {
        this.queryinput = this.queryinput.replace('-' + prefix + ' ' + name + ' ', '');
      } else if (this.queryinput.indexOf(name + ',') >= 0) {
        this.queryinput = this.queryinput.replace(name + ',', '');
      } else if (this.queryinput.indexOf(',' + name) >= 0) {
        this.queryinput = this.queryinput.replace(',' + name, '');
      } else if (this.queryinput.indexOf('-' + prefix + ' ' + name) >= 0) {
        this.queryinput = this.queryinput.replace('-' + prefix + ' ' + name, '');
      } else if (this.queryinput.indexOf(name + ' ') >= 0) {
        this.queryinput = this.queryinput.replace(name + ' ', ' ');
      }
    }
  }

  // TODO: move to object utils
  getDetectedConcepts(jsonConcepts: JsonConcepts[]): string {
    const conceptNames: string[] = jsonConcepts.map((obj) => obj.concept);
    return conceptNames.join(', ');
  }

  // TODO: move to object utils
  getDetectedTexts(jsonTexts: JsonTexts[]): string {
    const textNames: string[] = jsonTexts.map((obj) => obj.text);
    return textNames.join(', ');
  }

  // TODO: move key handling to util class strongly related to this query component. Maybe directly in the same folder. Don't call it util, call it handler to make it more clear.
  // TODO: be aware that we also need to use services here, so maybe we need to move the key handling to a util service?.
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEventUp(event: KeyboardEvent) {
    if (!this.queryFieldHasFocus && !this.answerFieldHasFocus) {
      if (event.key === 'q') {
        this.inputfield.nativeElement.select();
      }
      else if (event.key === 'e') {
        this.inputfield.nativeElement.focus();
      }
      else if (event.key === 'x') {
        this.resetQuery();
      }
      else if (event.key === 'Space' || event.key === ' ') {
          console.log('togglet fullimage ' + this.showFullImage);
          if (!(this.fullImageIndex >= 0 && this.resultURLs.length)) {
            this.fullImageIndex = 0;
          }
          this.fullImage = this.resultURLs[this.fullImageIndex];
          this.showFullImage = !this.showFullImage;
          if (this.showFullImage) {
            this.interactionLogService.logFullImageDisplay(this.fullImageIndex, this.fullImage);
          } else {
            this.interactionLogService.logFullImageHide(this.fullImageIndex, this.fullImage);
          }
      }
      else if (event.key === 'Escape') {
        if (this.showFullImage) {
          this.hideFullImage();
        }
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (!this.queryFieldHasFocus && !this.answerFieldHasFocus) {
      if (event.key == 'ArrowDown') {
        if (this.showFullImage) {
          if (this.fullImageIndex < this.resultURLs.length - LocalConfig.config_IMAGES_PER_ROW) {
            this.fullImageIndex += LocalConfig.config_IMAGES_PER_ROW;
            this.fullImage = this.resultURLs[this.fullImageIndex];
            this.performMetaDataQuery();
            this.interactionLogService.logFullImageDisplay(this.fullImageIndex, this.fullImage);
          }
          event.preventDefault();
        }
      }
      else if (event.key == 'ArrowUp') {
        if (this.showFullImage) {
          if (this.fullImageIndex > LocalConfig.config_IMAGES_PER_ROW) {
            this.fullImageIndex -= LocalConfig.config_IMAGES_PER_ROW;
            this.fullImage = this.resultURLs[this.fullImageIndex];
            this.performMetaDataQuery();
            this.interactionLogService.logFullImageDisplay(this.fullImageIndex, this.fullImage);
          }
          event.preventDefault();
        }
      }
      else if (event.key == 'ArrowRight') {
        if (this.showFullImage) {
          if (this.fullImageIndex < this.resultURLs.length-1) {
            this.fullImage = this.resultURLs[++this.fullImageIndex];
            this.performMetaDataQuery();
            this.interactionLogService.logFullImageDisplay(this.fullImageIndex, this.fullImage);
          }
        } else {
          this.hideFullImage();
          this.nextPage();
        }
        event.preventDefault();
      }
      else if (event.key == 'Tab') {
        this.hideFullImage();
        this.nextPage();
      }
      else if (event.key == "ArrowLeft") {
        // if full image, show next image, otherwise go to previous page
        if (this.showFullImage) {
          if (this.fullImageIndex > 0) {
            this.fullImage = this.resultURLs[--this.fullImageIndex];
            this.performMetaDataQuery();
            this.interactionLogService.logFullImageDisplay(this.fullImageIndex, this.fullImage);
          }
        } else {
          this.hideFullImage();
          this.prevPage();
        }
        event.preventDefault();
      } else if (event.key == "s" || event.key == "S") {
        if (this.showFullImage) {
          this.submitResult(this.fullImageIndex);
        }
      }
      else {
        switch (event.key) {
          case '1':
            this.gotoPage('1');
            break;
          case '2':
            this.gotoPage('2');
            break;
          case '3':
            this.gotoPage('3');
            break;
          case '4':
            this.gotoPage('4');
            break;
          case '5':
            this.gotoPage('5');
            break;
          case '6':
            this.gotoPage('6');
            break;
          case '7':
            this.gotoPage('7');
            break;
          case '8':
            this.gotoPage('8');
            break;
          case '9':
            this.gotoPage('9');
            break;
          case '0':
            this.gotoPage('10');
            break;
          default:
            break;
        }
      }
    }
  }

  prevPage() {
    let currPage = parseInt(this.selectedPage);
    if (currPage > 1) {
      this.selectedPage = (currPage - 1).toString();
      this.performQuery();
    }
  }

  nextPage() {
    let currPage = parseInt(this.selectedPage);
    if (currPage < this.pages.length) {
      this.selectedPage = (currPage + 1).toString();
      this.performQuery();
    }
  }

  gotoPage(pnum:string) {
    let testPage = parseInt(pnum);
    if (testPage < this.pages.length && testPage > 0) {
      this.hideFullImage();
      this.selectedPage = pnum;
      this.performQuery();
    }
  }

  // TODO: remove it and replace it with the method in the url-utils
  getBaseURL() {
    return GlobalConstants.keyframeBaseURL;
  }

  isVideoResult(dataset: string): boolean {
    return dataset.endsWith('v');
  }

  onQueryInputFocus() {
    this.queryFieldHasFocus = true;
  }

  onQueryInputBlur() {
    this.queryFieldHasFocus = false;
  }

  onAnswerInputFocus() {
    this.answerFieldHasFocus = true;
  }

  onAnswerInputBlur() {
    this.answerFieldHasFocus = false
  }


  showDaySummary(idx:number) {
    this.requestVideoSummaries(this.queryresult_videoid[idx]);
  }

  getFilenameFromItem(filepath: string) {
    const filenameWithExtension: string = filepath.split('/').pop() || '';
    const filename: string = filenameWithExtension.slice(0, -4);
    return filename
  }

   /****************************************************************************
   * Queries
   ****************************************************************************/

  resetPageAndPerformQuery() {
    this.selectedPage = '1';
    this.nodeServerInfo = "processing query, please wait...";
    this.performTextQuery();
  }


  performQuery() {
    this.fullImageIndex = -1;
    this.showFullImage = false;
    this.nodeServerInfo = "processing query, please wait...";
    //called from the paging buttons
    if (this.file_sim_keyframe && this.file_sim_pathPrefix) {
      this.performFileSimilarityQuery(this.file_sim_keyframe, this.file_sim_pathPrefix);
    }
    else if (this.previousQuery !== undefined && this.previousQuery.type === "similarityquery") {
      this.performSimilarityQuery(parseInt(this.previousQuery.query));
    } else {
      this.performTextQuery();
    }
  }

  performNewTextQuery() {
    this.selectedPage = '1';
    this.previousQuery = undefined;
    this.file_sim_keyframe = undefined;
    this.file_sim_pathPrefix = undefined;
    this.nodeServerInfo = "processing query, please wait...";
    this.performQuery();
  }

  performTextQuery() {
    if (this.clipService.connectionState === WSServerStatus.CONNECTED ||
        this.nodeService.connectionState === WSServerStatus.CONNECTED) {
      if (this.previousQuery !== undefined && this.previousQuery.type === 'textquery' && this.previousQuery.query !== this.queryinput) {
        this.selectedPage = '1';
      }

      console.log('qc: query for', this.queryinput);
      this.queryBaseURL = this.getBaseURL();
      let msg = {
        type: "textquery",
        clientId: "direct",
        query: this.queryinput,
        maxresults: this.maxresults,
        resultsperpage: this.resultsPerPage,
        selectedpage: this.selectedPage,
        queryMode: this.queryMode
      };
      this.previousQuery = msg;

      this.queryTimestamp = getTimestampInSeconds();

      if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {
        this.queryType = 'database/joint';
        this.sendToNodeServer(msg);
      } else {
        this.queryType = 'CLIP';
        this.sendToCLIPServer(msg);
      }
      this.saveToHistory(msg);

      //query logging
      this.queryEventLogService.logJointEmbedding(this.queryinput);

      //interaction logging
      this.interactionLogService.logTextQuery(this.queryinput, this.selectedPage);

    } else {
      console.log(`CLIP or NODE connection down: ${this.clipService.connectionState} ${this.nodeService.connectionState}.`);
    }
  }

  performSimilarityQuery(serveridx:number) {
    if (this.clipService.connectionState === WSServerStatus.CONNECTED) {
      //alert(`search for ${i} ==> ${idx}`);
      console.log('similarity-query for ', serveridx);
      this.queryBaseURL = this.getBaseURL();
      let msg = {
        type: "similarityquery",
        clientId: "direct",
        query: serveridx.toString(),
        maxresults: this.maxresults,
        resultsperpage: this.resultsPerPage,
        selectedpage: this.selectedPage,
        queryMode: this.queryMode
      };
      this.previousQuery = msg;

      this.queryTimestamp = getTimestampInSeconds();
      this.queryType = 'CLIP similarity';

      this.sendToCLIPServer(msg);
      this.saveToHistory(msg);

      //query logging
      this.queryEventLogService.logFeedbackModel(`result# ${this.queryresult_resultnumber[serveridx]}`)

      //interaction logging
      this.interactionLogService.logSimilarityQuery(serveridx, this.selectedPage);
    }
  }

  performFileSimilarityQuery(keyframe:string, pathprefix:string) {
    if (this.clipService.connectionState === WSServerStatus.CONNECTED) {

      console.log('file-similarity-query for ', keyframe);
      let msg = {
        type: "file-similarityquery",
        clientId: "direct",
        query: keyframe,
        pathprefix: pathprefix,
        maxresults: this.maxresults,
        resultsperpage: this.maxresults, //this.resultsPerPage,
        selectedpage: "1", //this.selectedPage,
        queryMode: this.queryMode
      };
      this.previousQuery = msg;

      this.queryTimestamp = getTimestampInSeconds();
      this.queryType = 'CLIP file-similarity';

      this.nodeServerInfo = 'processing similarity query, please wait...please also note that the query input field does not work for this search/tab, unfortunately.';
      this.sendToCLIPServer(msg);
      this.saveToHistory(msg);

      //query logging
      this.queryEventLogService.logFeedbackModel(keyframe);

      //interaction logging
      this.interactionLogService.logFileSimilarityQuery(keyframe, this.selectedPage);
    }
  }

  selectRun() {

  }

  performHistoryQuery() {
    console.log(`run hist: ${this.selectedHistoryEntry}`)
    let hist = localStorage.getItem('history')
    if (hist && this.selectedHistoryEntry !== "-1") {

      //logging
      this.queryEventLogService.logQueryRepetitionQuery(this.selectedHistoryEntry ?? '')

      //interaction logging
      this.interactionLogService.logHistoryQuery(hist)

      //perform history query
      let queryHistory:Array<QueryType> = JSON.parse(hist);
      let msg: QueryType = queryHistory[parseInt(this.selectedHistoryEntry!)];
      if (msg.type === 'textquery') {
        this.queryinput = msg.query;
        this.selectedPage = msg.selectedpage;
        this.queryMode = msg.queryMode;
        this.previousQuery = undefined;
        this.file_sim_keyframe = undefined;
        this.file_sim_pathPrefix = undefined;
        this.nodeServerInfo = "processing query, please wait...";
        this.performQuery();
      }
      else if (msg.type === 'file-similarityquery') {
        this.previousQuery = undefined;
        this.queryinput = '';
      }

      this.queryTimestamp = getTimestampInSeconds();
      this.queryType = 'history';

      //this.sendToCLIPServer(msg);
      //this.saveToHistory(msg);

      this.selectedHistoryEntry = "-1";
      this.historyDiv.nativeElement.hidden = true;


    }
  }

  performHistoryLastQuery() {
    let hist = localStorage.getItem('history')
    if (hist) {
      let queryHistory:Array<QueryType> = JSON.parse(hist);
      let msg: QueryType = queryHistory[0];
      if (msg.type === 'textquery') {
        this.queryinput = msg.query;
        this.selectedPage = msg.selectedpage;
      }

      this.queryTimestamp = getTimestampInSeconds();
      this.queryType = 'history last';

      this.sendToCLIPServer(msg);
    }
  }

  performMetaDataQuery() {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {

      console.log('qc: query metadata for', this.fullImage);
      let msg = {
        type: "metadataquery",
        imagepath: this.queryresults[this.fullImageIndex],
      };

      this.sendToNodeServer(msg);

    } else {
      console.log("nodeService not running");
    }
  }

  requestVideoSummaries(videoid:string) {
    if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {
      console.log('qc: get video summaries info from database', videoid);
      let msg = {
        type: "videosummaries",
        videoid: videoid
      };
      this.sendToNodeServer(msg);
    } else {
      alert(`Node.js connection down: ${this.nodeService.connectionState}. Try reconnecting by pressing the red button!`);
    }
  }

  // TODO: outsource to service
  sendToCLIPServer(msg:any) {
    let message = {
      source: 'appcomponent',
      content: msg
    };
    this.clipService.messages.next(message);
  }

  sendToNodeServer(msg:any) {
    let message = {
      source: 'appcomponent',
      content: msg
    };
    this.nodeService.messages.next(message);
  }

  showVideoShots(videoid:string, frame:string) {
    this.router.navigate(['video',videoid,frame]); //or navigateByUrl(`/video/${videoid}`)
  }

  performSimilarityQueryForIndex(idx:number) {
    this.hideFullImage();
    this.selectedPage = '1';
    let serveridx = this.queryresult_serveridx[idx];
    this.performSimilarityQuery(serveridx);
  }

  clearQuery() {
    this.queryinput = '';

    //interaction logging
    this.interactionLogService.logClearQuery();
  }

  resetQuery() {
    this.nodeServerInfo = undefined;
    this.queryinput = '';
    this.inputfield.nativeElement.focus();
    this.inputfield.nativeElement.select();
    this.file_sim_keyframe = undefined
    this.file_sim_pathPrefix = undefined
    this.previousQuery = undefined
    this.selectedPage = '1';
    //this.selectedDataset = 'v3c-s';
    this.pages = ['1'];
    this.clearResultArrays();
    let queryHistory:Array<QueryType> = [];
    localStorage.setItem('history', JSON.stringify(queryHistory));

    //interaction logging
    this.interactionLogService.logResetQuery(this.selectedPage, this.queryresults);

    this.expLogService.submitLog();
    this.expLogService.saveLogLocallyAndClear();
  }

  private clearResultArrays() {
    this.queryresults = [];
    this.resultURLs = [];
    this.queryresult_serveridx = [];
    this.queryresult_resultnumber = [];
    this.queryresult_videoid = [];
    this.queryresult_frame = [];
    this.queryresult_videopreview = [];
    this.queryTimestamp = 0;
    this.queryType = '';
  }

  /****************************************************************************
   * WebSockets (CLIP and Node.js)
   ****************************************************************************/

  connectToVBSServer() {
    this.vbsService.connect();
  }

  disconnectFromVBSServer() {
    //this.vbsService.logout(this);
  }

  checkNodeConnection() {
    if (this.nodeService.connectionState !== WSServerStatus.CONNECTED) {
      this.nodeService.connectToServer();
    }
  }

  checkCLIPConnection() {
    if (this.clipService.connectionState !== WSServerStatus.CONNECTED) {
      this.clipService.connectToServer();
    }
  }

  checkVBSServerConnection() {
    if (this.vbsService.vbsServerState == WSServerStatus.UNSET || this.vbsService.vbsServerState == WSServerStatus.DISCONNECTED) {
      this.connectToVBSServer();
    } else if (this.vbsService.vbsServerState == WSServerStatus.CONNECTED) {
      this.disconnectFromVBSServer();
    }
  }

  sendTopicAnswer() {
    this.vbsService.submitText(this.topicanswer)

    this.queryEventLogService.logSubmitAnswer(`result:${this.topicanswer}`);
    this.expLogService.submitLog();

    //interaction logging
    this.interactionLogService.logSubmitAnswer(this.topicanswer);

    //save and reset logs
    this.expLogService.saveLogLocallyAndClear();
  }

  handleNodeMessage(msg:any) {
    if (msg['summaries']) {
      let summaries = msg['summaries'];
      let summary = summaries[summaries.length-1];
      console.log(summary);
      this.videopreviewimage = GlobalConstants.dataHost + '/' + summary;
      this.videopreview.nativeElement.style.display = 'block';
    }
  }

  closeVideoPreview() {
    this.videopreview.nativeElement.style.display = 'none';
  }

  handleQueryResponseMessage(qresults:any) {
    console.log(qresults);

    if (qresults.totalresults === 0) {
      this.nodeServerInfo = 'The query returned 0 results!';
    }

    this.totalReturnedResults = qresults.totalresults; //totally existing results
    //create pages array
    this.pages = [];
    for (let i = 1; i <= this.totalReturnedResults / qresults.num; i++) {
      this.pages.push(i.toString());
    }
    //populate images
    this.clearResultArrays();

    let resultnum = (parseInt(this.selectedPage) - 1) * this.resultsPerPage + 1;
    this.querydataset = qresults.dataset;
    let keyframeBase = this.getBaseURL(); //TODO + 'thumbs/';

    let logResults:Array<QueryResult> = [];
    //for (var e of qresults.results) {
    for (let i = 0; i < qresults.results.length; i++) {
      let e = qresults.results[i];
      this.queryresults.push(e);
      this.resultURLs.push(keyframeBase + e);
      if ("resultsidx" in qresults) {
        this.queryresult_serveridx.push(qresults.resultsidx[i]);
      }
      this.queryresult_resultnumber.push(resultnum.toString());
      let logResult:QueryResult = {
        item: e,
        //score: qresults.scores[i],
        rank: resultnum
      }
      logResults.push(logResult)
      resultnum++;
    }

    this.inputfield.nativeElement.blur();

    //add to interaction log (created when query was sent)
    this.interactionLogService.updateLatestResults(this.queryresults);


    //create and send log
    this.queryResultLogService.logQueryResult(this.queryTimestamp, 'rankingModel @ ' + this.queryType, '' + Math.min(this.resultsPerPage, qresults.totalresults), logResults);

    this.nodeServerInfo = undefined;
  }

  closeWebSocketCLIP() {
    if (this.clipService.connectionState !== WSServerStatus.CONNECTED) {
      this.clipService.connectToServer();
    }
  }

  /****************************************************************************
   * Submission to VBS Server
   ****************************************************************************/

  submitResult(index: number) {
    const imageID = this.getFilenameFromItem(this.resultURLs[index])
    console.log(`${imageID}`);
    this.vbsService.submitImageID(imageID);

    this.queryEventLogService.logSubmit(`result:${index}`);
    this.expLogService.submitLog();


    //interaction logging
    this.interactionLogService.logSubmit(imageID, index)

    //save and reset logs
    this.expLogService.saveLogLocallyAndClear();
  }
}
