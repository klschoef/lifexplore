import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ResultPresenterService} from '../../../../../../services/result-presenter.service';
import {ShortcutService} from '../../../../../../services/shortcut.service';
import {SubmissionLogService} from '../../../../../../services/submission-log.service';
import {combineLatest, Subject, takeUntil} from 'rxjs';
import {VBSServerConnectionService} from '../../../../../../services/vbsserver-connection.service';

@Component({
  selector: 'app-submission-result-marker',
  templateUrl: './submission-result-marker.component.html',
  styleUrls: ['./submission-result-marker.component.scss']
})
export class SubmissionResultMarkerComponent implements OnInit, OnDestroy {
  @Input() result: any;

  destroy$ = new Subject<void>();
  cssClass = '';
  text = '';

  constructor(
    private submissionLogService: SubmissionLogService,
    private vbsServerConnection: VBSServerConnectionService
  ) {
  }

  ngOnInit() {
    combineLatest([
      this.submissionLogService.logOrModeChange$,
      this.vbsServerConnection.currentTaskState$
    ]).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      const submissionLog = this.submissionLogService.submissionLog$.value;
      const taskId = this.vbsServerConnection.currentTaskState$.value?.taskId;
      if (this.vbsServerConnection.selectedEvaluation && taskId) {

        const log = (submissionLog[this.vbsServerConnection.selectedEvaluation] ?? {})[taskId];
        if (log && log.some) {
          let found = false;
          for (let i = 0; i < log.length; i++) {
            const entry = log[i];
            if (entry.image === this.result.filename) {
              console.log("catched entry for evaluation", entry, this.vbsServerConnection.selectedEvaluation);
              if (entry.success == true) {
                this.cssClass = 'submitted-success';
                this.text = "SUCCESS";
              } else {
                if (entry.indeterminate || entry.undecidable) {
                  this.cssClass = 'submitted-pending';
                  this.text = "PENDING";
                } else if (entry.requestError) {
                  this.cssClass = 'submitted-request-failure';
                  this.text = entry.errorObject?.description ?? "Request Error";
                } else {
                  this.cssClass = 'submitted-failure';
                  this.text = "WRONG";
                }
              }
              found = true;
              break;
            }
          }

          if (!found) {
            this.cssClass = '';
          }
          return;
        }
      }
      this.cssClass = '';
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
