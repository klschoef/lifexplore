import { Injectable, EventEmitter, OnInit } from '@angular/core';

import {ApiVerdictStatus, UserService} from '../../../../openapi/dres';
import { EvaluationClientService } from '../../../../openapi/dres';
import { SubmissionService } from '../../../../openapi/dres';
import { VbsServiceCommunication } from '../../shared/interfaces/vbs-task-interface';
//import {LogService} from '../../openapi/dres/api/log.service';

//import * as videoDataFPS from '../assets/v3c_video_fps.json';

import {
  ApiClientAnswer,
  ApiClientAnswerSet,
  ApiClientSubmission,
  ApiEvaluationInfo, ApiClientEvaluationInfo,
  ApiEvaluationStatus,
  ApiUser,
  LoginRequest, LogService,
  QueryEvent,
  QueryResultLog,
  SuccessfulSubmissionsStatus,
  SuccessStatus,
  ApiClientTaskTemplateInfo,
  ApiTaskTemplateInfo,
  EvaluationService,
  ApiEvaluationState,
  QueryEventLog,
  RankedAnswer,
  QueryEventCategory,
  StatusService
} from '../../../../openapi/dres';
import { GlobalConstants, WSServerStatus } from '../../shared/config/global-constants';
import {BehaviorSubject, catchError, Observable, of, tap} from 'rxjs';
import { AppComponent } from '../../app.component';
import { GlobalConstantsService } from '../../shared/config/services/global-constants.service';
import {SubmissionLogService} from './submission-log.service';
import {SettingsService} from './settings.service';

interface ExtendedQueryResultLog extends QueryResultLog {
  serverTime: number;
  serverTimeDiff: number;
}


@Injectable({
  providedIn: 'root'
})
export class VBSServerConnectionService {

  errorMessageEmitter = new EventEmitter<string>();
  successMessageEmitter = new EventEmitter<string>();

  sessionId: string | undefined;
  vbsServerState: WSServerStatus = WSServerStatus.UNSET;
  intervalUpdateError = false;

  serverRuns: Array<string> = [];
  serverRunIDs: Array<string> = [];
  evaluations: Array<ApiClientEvaluationInfo> = [];
  serverRunStates = new Map();
  serverRunsRemainingSecs = new Map();
  currentTaskIsAVS = false;
  selectedEvaluation: string | undefined = undefined;
  currentTaskState$ = new BehaviorSubject<ApiEvaluationState | null>(null);

  serverTimestamp = 0;
  serverTimeDiff = 0;

  queryEvents: Array<QueryEvent> = [];
  queryResults: Array<RankedAnswer> = [];
  //queryResultLog: Array<QueryResultLog> = [];

  lastRunInfoRequestReturned404 = false;

  activeUsername: string = '';
  submissionResponse: string = '';

  constructor(
    private globalConstants: GlobalConstantsService,
    private userService: UserService,
    private evaluationClientService: EvaluationClientService,
    private evaluationService: EvaluationService,
    private submissionService: SubmissionService,
    private logService: LogService,
    private statusService: StatusService,
    private submissionLogService: SubmissionLogService,
    private settingsService: SettingsService
  ) {
    this.println(`VBSServerConnectionService created`);
    this.activeUsername = this.globalConstants.configUSER; //GlobalConstants.configUSER;
    this.selectedEvaluation = this.settingsService.settings$.value[SettingsService.LOCAL_SELECTED_EVALUATION];
    this.connect();
  }


  connect() {
    //console.log(`connecting to VBS Server: ${this.globalConstants.configUSER} and ${this.globalConstants.configPASS}`);
    // === Handshake / Login ===
    this.userService.postApiV2Login({
      username: this.globalConstants.configUSER, //GlobalConstants.configUSER,
      password: this.globalConstants.configPASS //GlobalConstants.configPASS
    } as LoginRequest)
      .subscribe((login: ApiUser) => {
        this.println('Login successful\n' +
          `user: ${login.username}, ` +
          `role: ${login.role}, ` +
          `session: ${login.sessionId}`);

        // Successful login
        this.vbsServerState = WSServerStatus.CONNECTED;

        /*
        It is better pratice, to let the browser properly handle
        cookies. In order to to that, uncomment the "withCredentials"
        in the app.module.ts line to not have to worry about the session.
        */
        this.sessionId = login.sessionId;
        //this.println(this.sessionId!);

        // Wait for a second (do other things)
        setTimeout(() => {
          // === Evaluation Run Info ===
          this.evaluationClientService.getApiV2ClientEvaluationList(this.sessionId!).subscribe((evaluations: ApiClientEvaluationInfo[]) => {
            this.println(`Found ${evaluations.length} ongoing evaluations`);
            this.serverRuns = [];
            this.serverRunIDs = [];
            this.evaluations = []
            evaluations.forEach((evaluation: ApiClientEvaluationInfo) => {
              this.println(`${evaluation.id} ${evaluation.name} ${evaluation.type} ${evaluation.status}`);
              this.serverRuns.push(evaluation.name);
              //if (evaluation.templateDescription) {
              //  this.serverRuns.push(evaluation.templateDescription);
              //} else {
              //  this.serverRuns.push(evaluation.name);
              //}
              this.serverRunStates.set(evaluation.id, evaluation.status);
              this.serverRunIDs.push(evaluation.id);
              this.evaluations.push(evaluation);
              this.serverRunsRemainingSecs.set(evaluation.id, '00:00');
            });

            // set the selected evaluation to the last one, if it is not set or the current selected evaluation isn't in the list anymore
            if (this.selectedEvaluation == undefined || !evaluations.some(evaluation => evaluation.id === this.selectedEvaluation)) {
              this.selectedEvaluation = this.serverRunIDs[this.serverRunIDs.length - 1];
              this.submissionLogService.logOrModeChange$.next(null);
            }
          });
        });

        this.getServerTime();
        setInterval(() => {
          this.getServerTime();
        }, 10000);

        this.evaluationService.configuration.username = this.globalConstants.configUSER;
        this.evaluationService.configuration.password = this.globalConstants.configPASS;

        setInterval(() => {
          if (this.selectedEvaluation) {
            this.evaluationService.getApiV2EvaluationByEvaluationIdState(this.selectedEvaluation,
              undefined,
              undefined,
              {

              })
              .subscribe((taskState: ApiEvaluationState | null) => {
              this.currentTaskState$.next(taskState);
            });
          }
        }, 1000);

        this.submissionLogService.logOrModeChange$.subscribe(() => {
          if (this.selectedEvaluation) {
            this.evaluationService.getApiV2EvaluationByEvaluationIdState(this.selectedEvaluation)
              .subscribe((taskState: ApiEvaluationState | null) => {
                console.log("current task info", taskState);
                this.currentTaskState$.next(taskState);
              });
          }
        });

      }, error => {
        console.log("cannot log in");
        this.vbsServerState = WSServerStatus.DISCONNECTED;
      });
  }

  changeAndSaveSelectedEvaluation(id: string) {
    console.log("changeEvaluation:", id);
    this.selectedEvaluation = id;
    this.submissionLogService.logOrModeChange$.next(null);
    this.settingsService.setSettings({
      ...this.settingsService.settings$.value,
      [SettingsService.LOCAL_SELECTED_EVALUATION]: id
    });
  }

  getClientTaskInfo(runId: string, comm: VbsServiceCommunication) { // Only used from old query
    try {
      if (this.lastRunInfoRequestReturned404 || this.intervalUpdateError) {
        return;
      }

      if (this.serverRunStates.get(runId) == 'ACTIVE' && this.vbsServerState == WSServerStatus.CONNECTED) {
        //console.log('requesting info for ' + runId + ' and session ' + this.sessionId!);

        this.evaluationClientService.getApiV2ClientEvaluationCurrentTaskByEvaluationId(runId, this.sessionId!)
          .pipe(
            catchError((error: any) => {
              this.intervalUpdateError = true;
              console.log("disabling second-interval updates, due to connection error");
              console.log('Error ' + error.status + ' when requesting evaluations!', error);
              if (error.status == 404) {
                this.lastRunInfoRequestReturned404 = true;
              }
              return of(null);  // Return an observable that emits no items to the observer
            })
          ).subscribe((info: ApiClientTaskTemplateInfo | null) => {
          if (info != null) {
            if (info.taskGroup.includes('AVS')) {
              this.currentTaskIsAVS = true;
            } else {
              this.currentTaskIsAVS = false;
            }
            //console.log(`task: ${info.taskGroup} ${info.taskType} ${info.duration}`);
            comm.statusTaskInfoText = info.name; //+ ', ' + info.id + ", " + info.taskGroup;
          }
        })


        this.evaluationService.getApiV2EvaluationStateList()
          .pipe(
            catchError((error: any) => {
              this.intervalUpdateError = true;
              console.log("disabling second-interval updates, due to connection error");
              console.log('error occurred when requesting evaluation state list!', error);
              return of(null);  // Return an observable that emits no items to the observer
            })
          ).subscribe((states: Array<ApiEvaluationState> | null) => {
          states?.forEach((eState) => {
            //console.log(`status: ${eState.taskStatus} timeleft:${eState.timeLeft}`);
            if (eState.evaluationStatus == 'ACTIVE' && eState.taskStatus == 'RUNNING') {
              this.serverRunsRemainingSecs.set(eState.evaluationId, this.createTimestamp(eState.timeLeft) + ' ');
              //console.log(this.serverRunsRemainingSecs.get(eState.evaluationId) + ' - ' + eState.evaluationId);
            } else {
              this.serverRunsRemainingSecs.set(eState.evaluationId, eState.evaluationStatus);
            }

          })
        })
      } else {
        comm.statusTaskInfoText = 'no task active';
      }
    } catch (error) {
      console.log('issue with task info request');
    }
  }


  createTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const timestamp = `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
    return timestamp;
  }

  padZero(value: number): string {
    return value.toString().padStart(2, '0');
  }

  /*getRunInfoList() {
    this.evaluationClientService.getApiV1ClientRunInfoList(this.sessionId!).subscribe((info: ClientRunInfoList) => {
      for (const r of info.runs) {
        console.log(r)
      }
    })
  }*/

  handleSubmissionSuccess(status: SuccessfulSubmissionsStatus, info: string) {
    this.println('The submission was successful.');

    this.submissionResponse = 'Submission successfull!'
    this.successMessageEmitter.emit(this.submissionResponse);
  }

  private handleSubmissionError(err: any) {
    let errorMsg = '';
    if (err.status === 401) {
      errorMsg = 'There was an authentication error during the submission. Check the session id.';
      console.log(errorMsg);
      console.error(errorMsg);
      this.errorMessageEmitter.emit(errorMsg);
    } else if (err.status === 404) {
      errorMsg = 'There is currently no active task which would accept submissions.';
      console.log(errorMsg);
      console.error(errorMsg);
      this.errorMessageEmitter.emit(errorMsg);
    } else {
      //console.log(`Something unexpected went wrong during the submission: : ${JSON.stringify(err)}`);
      this.errorMessageEmitter.emit(err.error.description);
    }
    return of(null);
  }

  submitImageID(imageID: string) {
    // === Submission ===
    //'00:00:10:00', // timecode - in this case, we use the timestamp in the form HH:MM:SS:FF
    console.log("runids", this.serverRunIDs, this.selectedEvaluation);
    const lastEvaluationId = this.selectedEvaluation ?? this.serverRunIDs[this.serverRunIDs.length - 1];
    this.submissionService.postApiV2SubmitByEvaluationId(lastEvaluationId, {
        answerSets: [
          {
            answers: [
              {
                mediaItemName: imageID
              }
            ]
          } as ApiClientAnswerSet
        ]
      } as ApiClientSubmission,

      this.sessionId!).pipe(
      tap((status: SuccessfulSubmissionsStatus) => {
        console.log("submission response status", status);
        let success = status.submission === ApiVerdictStatus.CORRECT;
        const indeterminate = status.submission === ApiVerdictStatus.INDETERMINATE;
        const undecidable = status.submission === ApiVerdictStatus.UNDECIDABLE;
        if (success) {
          this.handleSubmissionSuccess(status, ''+imageID);
        } else {
          console.error('Submission failed');
        }

        this.submissionLogService.addEntryToLog({
          image: imageID,
          success: success,
          indeterminate: indeterminate,
          undecidable: undecidable,
          evaluation: lastEvaluationId,
          task: this.currentTaskState$.value ?? {} as ApiEvaluationState,
          requestError: false,
          errorObject: null,
          responseObject: status
        });
        this.submitQueryResultLogDirectly('interaction', [], [
          {
            timestamp: Date.now(),
            category: QueryEventCategory.IMAGE,
            type: "submitImage",
            value: imageID
          }
        ]);
      }),
      catchError(err => {
        this.submissionLogService.addEntryToLog({
            image: imageID,
            success: false,
            indeterminate: false,
            undecidable: false,
            evaluation: lastEvaluationId,
            task: this.currentTaskState$.value ?? {} as ApiEvaluationState,
            requestError: true,
            errorObject: err.error,
            responseObject: null
          });
        return this.handleSubmissionError(err);
      })
    ).subscribe()
  }


  submitText(text: string) {
    const lastEvaluationId = this.selectedEvaluation ?? this.serverRunIDs[this.serverRunIDs.length - 1];
    this.submissionService.postApiV2SubmitByEvaluationId(lastEvaluationId, {
        answerSets: [
          {
            answers: [
              {
                text: text, //text - in case the task is not targeting a particular content object but plaintext
                mediaItemName: undefined, //'00001', // item -  item which is to be submitted
                mediaItemCollectionName: undefined, // collection - does not usually need to be set
                start: undefined, // 10_000, //start time in milliseconds
                end: undefined //end time in milliseconds, in case an explicit time interval is to be specified
              } as ApiClientAnswer
            ]
          } as ApiClientAnswerSet
        ]
      } as ApiClientSubmission,

      this.sessionId!).subscribe((submissionResponse: SuccessfulSubmissionsStatus) => {
        // Check if submission as successful
        this.handleSubmissionSuccess(submissionResponse, 't:' + text);
        this.submissionLogService.addEntryToLog({
            image: text,
            success: false,
            indeterminate: true,
            undecidable: false,
            evaluation: lastEvaluationId,
            task: this.currentTaskState$.value ?? {} as ApiEvaluationState,
            requestError: false,
            errorObject: null,
            responseObject: submissionResponse
          });

        this.submitQueryResultLogDirectly('interaction', [], [
          {
            timestamp: Date.now(),
            category: QueryEventCategory.TEXT,
            type: "submitText",
            value: text
          }
        ]);
      }
      , error => {
        this.handleSubmissionError(error);
        this.submissionLogService.addEntryToLog({
            image: text,
            success: false,
            indeterminate: false,
            undecidable: false,
            evaluation: lastEvaluationId,
            task: this.currentTaskState$.value ?? {} as ApiEvaluationState,
            requestError: true,
            errorObject: error.error,
            responseObject: null
          });
      });
  }

  submitQueryResultLogDirectly(sortTye: string, results: Array<RankedAnswer>, events: Array<QueryEvent>, page: string = '') {
    this.queryResults = results;
    this.queryEvents = events;

    this.submitQueryResultLog(sortTye, page);
  }

  submitQueryResultLog(sortType: string, page: string = '') {

    if (!(this.settingsService.settings$.value[SettingsService.LOCAL_MISC_SETTINGS]?.logToDRES?? true)) {
      return;
    }

    let qrl = {
      timestamp: Date.now(),
      sortType: sortType,
      resultSetAvailability: 'page ' + page,
      results: this.queryResults,
      events: this.queryEvents
    } as QueryResultLog;
    if (page === '') {
      qrl.resultSetAvailability = 'image';
    }

    this.saveLogLocally(qrl);

    const lastEvaluationId = this.selectedEvaluation ?? this.serverRunIDs[this.serverRunIDs.length - 1];
    this.logService.postApiV2LogResultByEvaluationId(lastEvaluationId, this.sessionId!, qrl)
      .subscribe(
        (response) => {
          let info = 'QueryResultLog: ' + JSON.stringify(response);
          //console.log(info);
          //this.successMessageEmitter.emit(response.description);
          this.queryResults = []; //clear all results
          this.queryEvents = []; //clear all events
        },
        (error) => {
          console.error('QueryResultLog error: ', JSON.stringify(error));
          this.errorMessageEmitter.emit(error.error.description);
        }
      );
  }


  saveLogLocally(qrOrig: QueryResultLog) {
    let qr = JSON.parse(JSON.stringify(qrOrig));
    //qr.results = [];
    qr.results = qr.results.slice(0, 10);

    let qrl: ExtendedQueryResultLog = qr as unknown as ExtendedQueryResultLog;
    qrl.serverTime = this.serverTimestamp;
    qrl.serverTimeDiff = this.serverTimeDiff;

    let LSname = 'VBS2024QueryResultLog';
    let log = localStorage.getItem(LSname);
    if (log) {
      let loga = JSON.parse(log);
      loga.push(qrl);
      localStorage.setItem(LSname, JSON.stringify(loga));
    } else {
      let loga = [qrl];
      localStorage.setItem(LSname, JSON.stringify(loga));
    }
  }

  logout(appComp: AppComponent) {
    // === Graceful logout ===
    this.userService.getApiV2Logout(this.sessionId!).subscribe((logout: SuccessStatus) => {
      if (logout.status) {
        this.vbsServerState = WSServerStatus.DISCONNECTED;
        this.println('Successfully logged out');
      } else {
        this.println('Error during logout: ' + logout.description);
      }
    });
  }

  getServerTime() {
    let myTime = Date.now();
    this.statusService.getApiV2StatusTime().subscribe((status) => {
      this.serverTimeDiff = status.timeStamp - myTime;
      this.serverTimestamp = status.timeStamp;
      //console.log("got server time: " + status.timeStamp + " diff=" + this.serverTimeDiff);
    });
  }

  private println(msg: string): void {
    console.log(msg);
  }
}
