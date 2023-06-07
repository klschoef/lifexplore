import { ViewChild,ElementRef,Component, AfterViewInit } from '@angular/core';
import { HostListener } from '@angular/core';
import { GlobalConstants, WSServerStatus, WebSocketEvent, formatAsTime, QueryType, getTimestampInSeconds } from '../global-constants';
import { VBSServerConnectionService } from '../vbsserver-connection.service';
import { NodeServerConnectionService } from '../nodeserver-connection.service';
import { ClipServerConnectionService } from '../clipserver-connection.service';
import { Router,ActivatedRoute } from '@angular/router';
import { query } from '@angular/animations';
import { QueryEvent, QueryResult, QueryResultLog } from 'openapi/dres';
import { LocalConfig } from '../local-config';



interface JsonObjects {
  object: string;
  score: number;
  bbox: number[];
}

interface JsonConcepts {
  concept: string;
  score: number;
}

interface JsonTexts {
  text: string;
}

@Component({
  selector: 'app-query',
  templateUrl: './query.component.html',
  styleUrls: ['./query.component.scss']
})
export class QueryComponent implements AfterViewInit {

  @ViewChild('inputfield') inputfield!: ElementRef<HTMLInputElement>;
  @ViewChild('historyDiv') historyDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('videopreview') videopreview!: ElementRef<HTMLDivElement>;
  
  localConfig = LocalConfig;

  file_sim_keyframe: string | undefined
  file_sim_pathPrefix: string | undefined
  
  
  queryinput: string = '';
  topicanswer: string = '';
  queryresults: Array<string> = [];
  resultURLs: Array<string> = [];
  queryresult_serveridx: Array<number> = [];
  queryresult_resultnumber: Array<string> = [];
  queryresult_videoid: Array<string> = [];
  queryresult_frame: Array<string> = [];
  queryresult_videopreview: Array<string> = [];
  queryTimestamp: number = 0;
  metadata: any;
  
  public statusTaskInfoText: string = ""; //property binding
  statusTaskRemainingTime: string = ""; //property binding

  videopreviewimage: string = '';

  showFullImage: boolean = false;
  fullImage: string = '';
  fullImageIndex: number = -1;

  previousQuery : any | undefined;

  querydataset: string = '';
  queryBaseURL = this.getBaseURL();
  
  maxresults = LocalConfig.config_MAX_RESULTS_TO_RETURN; 
  totalReturnedResults = 0; //how many results did our query return in total?
  resultsPerPage = LocalConfig.config_RESULTS_PER_PAGE; 
  selectedPage = '1'; //user-selected page
  pages = ['1']
  
  thumbSize = 'small';
  selectedDataset = 'all';
  selectedHistoryEntry: string | undefined
  selectedServerRun: string | undefined
  queryFieldHasFocus = false;
  showButtons = -1;
  datasets = [
    {id: 'all', name: 'All days'},
    {id: 'v3c-v', name: 'Videos: V3C'},
    {id: 'marine-s', name: 'Shots: Marine'},
    {id: 'marine-v', name: 'Videos: Marine'} 
  ];
    
  constructor(
    public vbsService: VBSServerConnectionService,
    public nodeService: NodeServerConnectionService,
    public clipService: ClipServerConnectionService, 
    private route: ActivatedRoute,
    private router: Router) {
  }

  
  ngOnInit() {
    console.log('query component (qc) initated');

    this.route.paramMap.subscribe(paraMap => {
      this.file_sim_keyframe = paraMap.get('id')?.toString();
      if (this.file_sim_keyframe) {
        console.log(`qc: ${this.file_sim_keyframe}`);
      }
      this.file_sim_pathPrefix = paraMap.get('id2')?.toString();
      if (this.file_sim_pathPrefix) {
        console.log(`qc: ${this.file_sim_pathPrefix}`);
        if (this.file_sim_pathPrefix === 'thumbsXL') {
          this.selectedDataset = 'v3c-s';
        } else if (this.file_sim_pathPrefix === 'thumbsmXL') {
          this.selectedDataset = 'marine-s';
        }
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
      if ('wsstatus' in msg) { 
        console.log('qc: node-notification: connected');
      } else {
        //let result = msg.content;
        console.log("qc: response from node-server: " + msg);
        if ("scores" in msg) {
          this.handleCLIPMessage(msg); 
        } else {
          if ("type" in msg) {
            let m = JSON.parse(JSON.stringify(msg));
            if (m.type == 'metadata') {
              this.metadata = m.results[0];
              console.log('received metadata: ' + JSON.stringify(msg));
              if (this.metadata?.location) {
              }
            } else {
              //this.map = null;
            }
          } else {
            //this.handleNodeMessage(msg);
            this.handleCLIPMessage(msg);
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
        this.handleCLIPMessage(msg);
      }
    });

    document.addEventListener('keydown', this.handleKeyDown);

    //repeatedly retrieve task info
    setInterval(() => {
      this.requestTaskInfo();
    }, 1000);
  }

  ngAfterViewInit(): void {
    this.historyDiv.nativeElement.hidden = true;
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  reloadComponent(): void {
    window.location.reload();
  }

  handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hideFullImage();
    }
  };

  requestTaskInfo() {
    this.vbsService.getClientTaskInfo(this.vbsService.serverRunIDs[0], this);
  }

  displayFullImage(url: string, index: number) {
    this.fullImage = url;
    this.fullImageIndex = index;
    this.performMetaDataQuery();
    this.showFullImage = true;
  }

  hideFullImage() {
    this.showFullImage = false;
    this.fullImage = '';
  }

  toggleHistorySelect() {
    this.historyDiv.nativeElement.hidden = !this.historyDiv.nativeElement.hidden;
    /*if (!this.historyDiv.nativeElement.hidden) {
      this.historyDiv.nativeElement.focus();
    }*/
  }

  history() {
    let historyList = [];
    let hist = localStorage.getItem('history')
    if (hist) {
      let histj:[QueryType] = JSON.parse(hist);
      for (let i=0; i < histj.length; i++) {
        let ho = histj[i];
        historyList.push(`${ho.type}: ${ho.query} (${ho.dataset})`)
      }
    }
    return historyList; //JSON.parse(hist!);
  }

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
        if (qh.query === msg.query && qh.dataset === msg.dataset) {
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

  asTimeLabel(frame:string, withFrames:boolean=true) {
    console.log('TODO: need FPS in query component!')
    return frame;
    //return formatAsTime(frame, this.fps, withFrames);
  }


  getDetectedObjects(jsonObjects: JsonObjects[]): string {
    const objectNames: string[] = jsonObjects.map((obj) => obj.object);
    return objectNames.join(', ');
  }

  getDetectedConcepts(jsonConcepts: JsonConcepts[]): string {
    const conceptNames: string[] = jsonConcepts.map((obj) => obj.concept);
    return conceptNames.join(', ');
  }

  getDetectedTexts(jsonTexts: JsonTexts[]): string {
    const textNames: string[] = jsonTexts.map((obj) => obj.text);
    return textNames.join(', ');
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEventUp(event: KeyboardEvent) { 
    
    if (this.queryFieldHasFocus == false) {
      if (event.key === 'q') {
        this.inputfield.nativeElement.select();
      }
      else if (event.key === 'e') {
        this.inputfield.nativeElement.focus();
      }  
      else if (event.key === 'v') {
        this.selectedPage = '1';
        this.selectedDataset = this.selectedDataset.replace('-s','-v');
        this.performTextQuery();
      }
      /*else if (event.key === 's') {
        this.selectedPage = '1';
        this.selectedDataset = this.selectedDataset.replace('-v','-s');
        this.performTextQuery();
      }*/
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
      }
      else if (event.key === 'Escape') {
        this.closeVideoPreview();
      }
    }
  }


  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
    if (this.queryFieldHasFocus == false) {
      if (event.key == 'ArrowDown') {
        if (this.showFullImage) {
          if (this.fullImageIndex < this.resultURLs.length - LocalConfig.config_IMAGES_PER_ROW) {
            this.fullImageIndex += LocalConfig.config_IMAGES_PER_ROW;
            this.fullImage = this.resultURLs[this.fullImageIndex];
            this.performMetaDataQuery();
          }
        }
      }
      else if (event.key == 'ArrowUp') {
        if (this.showFullImage) {
          if (this.fullImageIndex > LocalConfig.config_IMAGES_PER_ROW) {
            this.fullImageIndex -= LocalConfig.config_IMAGES_PER_ROW;
            this.fullImage = this.resultURLs[this.fullImageIndex];
            this.performMetaDataQuery();
          }
        }
      }
      else if (event.key == 'ArrowRight') {
        if (this.showFullImage) {
          if (this.fullImageIndex < this.resultURLs.length-1) {
            this.fullImage = this.resultURLs[++this.fullImageIndex];
            this.performMetaDataQuery();
          }
        } else {
          this.hideFullImage();
          this.nextPage();               
        }
      }
      else if (event.key == 'Tab') {
        this.hideFullImage();
        this.nextPage();     
      } else if (event.key == "ArrowLeft") {
        if (this.showFullImage) {
          if (this.fullImageIndex > 0) {
            this.fullImage = this.resultURLs[--this.fullImageIndex];
            this.performMetaDataQuery();
          }
        } else {
          this.hideFullImage();
          this.prevPage();
        }
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

  getBaseURLFromKey(selDat: string) {
    return GlobalConstants.keyframeBaseURL;
  }

  getBaseURL() {
    return this.getBaseURLFromKey(this.selectedDataset);
  }

  isVideoResult(dataset: string): boolean {
    return dataset.endsWith('v');
  }

  getIDPartNums() {
    if (this.selectedDataset == 'marine-v' || this.selectedDataset == 'marine-s') {
      return 3; 
    }
    else { //if (this.selectedDataset == 'v3c-v' || this.selectedDataset == 'v3c-v') {
      return 1;
    }
  }

  onQueryInputFocus() {
    this.queryFieldHasFocus = true;
  }

  onQueryInputBlur() {
    this.queryFieldHasFocus = false;
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


  performQuery() {
    this.fullImageIndex = -1;
    this.showFullImage = false;
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
        query: this.queryinput,
        maxresults: this.maxresults,
        resultsperpage: this.resultsPerPage, 
        selectedpage: this.selectedPage, 
        dataset: this.selectedDataset
      };
      this.previousQuery = msg;

      if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {
        this.sendToNodeServer(msg);
      } else {
        this.sendToCLIPServer(msg);
      }
      this.saveToHistory(msg);

      let queryEvent:QueryEvent = {
        timestamp: getTimestampInSeconds(),
        category: QueryEvent.CategoryEnum.TEXT,
        type: 'jointEmbedding',
        value: this.queryinput
      }
      this.vbsService.queryEvents.push(queryEvent);
      
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
        query: serveridx.toString(),
        maxresults: this.maxresults,
        resultsperpage: this.resultsPerPage, 
        selectedpage: this.selectedPage, 
        dataset: this.selectedDataset
      };
      this.previousQuery = msg;

      this.sendToCLIPServer(msg);
      this.saveToHistory(msg);

      let queryEvent:QueryEvent = {
        timestamp: getTimestampInSeconds(),
        category: QueryEvent.CategoryEnum.IMAGE,
        type: 'feedbackModel',
        value: `result# ${this.queryresult_resultnumber[serveridx]}` 
      }
      this.vbsService.queryEvents.push(queryEvent);
    }
  }

  performFileSimilarityQuery(keyframe:string, pathprefix:string) {
    if (this.clipService.connectionState === WSServerStatus.CONNECTED) {

      console.log('file-similarity-query for ', keyframe);
      let msg = { 
        type: "file-similarityquery", 
        query: keyframe,
        pathprefix: pathprefix, 
        maxresults: this.maxresults,
        resultsperpage: this.resultsPerPage, 
        selectedpage: this.selectedPage,
        dataset: this.selectedDataset 
      };
      this.previousQuery = msg;

      this.sendToCLIPServer(msg);
      this.saveToHistory(msg);

      let queryEvent:QueryEvent = {
        timestamp: getTimestampInSeconds(),
        category: QueryEvent.CategoryEnum.IMAGE,
        type: 'feedbackModel',
        value: `${keyframe}` 
      }
      this.vbsService.queryEvents.push(queryEvent);
    }
  }

  selectRun() {

  }

  performHistoryQuery() {
    console.log(`run hist: ${this.selectedHistoryEntry}`)
    let hist = localStorage.getItem('history')
    if (hist && this.selectedHistoryEntry !== "-1") {
      let queryHistory:Array<QueryType> = JSON.parse(hist);
      let msg: QueryType = queryHistory[parseInt(this.selectedHistoryEntry!)];
      if (msg.type === 'textquery') {
        this.queryinput = msg.query;
        this.selectedDataset = msg.dataset;
        this.selectedPage = msg.selectedpage;
        this.previousQuery = undefined;
        this.file_sim_keyframe = undefined;
        this.file_sim_pathPrefix = undefined;
      }
      else if (msg.type === 'file-similarityquery') {
        this.previousQuery = undefined;
        this.queryinput = '';
      }

      this.sendToCLIPServer(msg);
      this.saveToHistory(msg);
      
      this.selectedHistoryEntry = "-1";
      this.historyDiv.nativeElement.hidden = true;

      let queryEvent:QueryEvent = {
        timestamp: getTimestampInSeconds(),
        category: QueryEvent.CategoryEnum.OTHER,
        type: 'queryRepetition',
        value: `${this.selectedHistoryEntry}` 
      }
      this.vbsService.queryEvents.push(queryEvent);
    }
  }

  performHistoryLastQuery() {
    let hist = localStorage.getItem('history')
    if (hist) {
      let queryHistory:Array<QueryType> = JSON.parse(hist);
      let msg: QueryType = queryHistory[0];
      if (msg.type === 'textquery') {
        this.queryinput = msg.query;
        this.selectedDataset = msg.dataset;
        this.selectedPage = msg.selectedpage;
      }

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

      if (this.nodeService.connectionState === WSServerStatus.CONNECTED) {
        this.sendToNodeServer(msg);
      }
      
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

  sendToCLIPServer(msg:any) {
    let message = {
      source: 'appcomponent',
      content: msg
    };
    this.clipService.messages.next(message);
    this.queryTimestamp = getTimestampInSeconds();
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

  resetPageAndPerformQuery() {
    this.selectedPage = '1';
    this.performTextQuery();
  }

  resetQuery() {
    this.vbsService.submitLog();
    this.vbsService.saveLogLocally();
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
    this.vbsService.queryEvents = []
    this.vbsService.resultLog = undefined
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

  handleCLIPMessage(qresults:any) {
    console.log(qresults);
    
    

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
    let keyframeBase = this.getBaseURLFromKey(qresults.dataset);
    
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

    //create and send log
    let log : QueryResultLog = {
      timestamp: this.queryTimestamp,
      sortType: 'rankingModel',
      resultSetAvailability: this.resultsPerPage.toString(), //top-k, for me: all return items 
      results: logResults,
      events: this.vbsService.queryEvents
    }
    this.vbsService.resultLog = log;

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

    let queryEvent:QueryEvent = {
      timestamp: getTimestampInSeconds(),
      category: QueryEvent.CategoryEnum.OTHER,
      type: 'submit',
      value: `result:${index}` 
    }
    this.vbsService.queryEvents.push(queryEvent);
    this.vbsService.submitLog();
    this.vbsService.saveLogLocally();

  }


}
