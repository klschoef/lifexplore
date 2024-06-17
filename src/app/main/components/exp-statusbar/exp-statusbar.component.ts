import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {WSServerStatus} from '../../../shared/config/global-constants';
import {PythonServerService} from '../../services/pythonserver.service';
import {VBSServerConnectionService} from '../../services/vbsserver-connection.service';
import {SubmissionLogService} from '../../services/submission-log.service';
import {map} from 'rxjs/operators';
import {combineLatest, filter, Subject, switchMap, takeUntil, tap} from 'rxjs';
import {GlobalConstantsService} from '../../../shared/config/services/global-constants.service';
import {ShortcutService} from '../../services/shortcut.service';
import {SettingsService} from '../../services/settings.service';

@Component({
  selector: 'exp-statusbar',
  templateUrl: './exp-statusbar.component.html',
  styleUrls: ['./exp-statusbar.component.scss']
})
export class ExpStatusbarComponent implements OnInit, OnDestroy {

    protected readonly WSServerStatus = WSServerStatus;
    dresUser = this.globalConstants.configUSER;

    submissionLog$ = combineLatest([
      this.submissionLogService.logOrModeChange$,
      this.vbsServerConnectionService.currentTaskState$
    ]).pipe(
      switchMap(_ => this.submissionLogService.submissionLog$),
      filter(log => !!this.vbsServerConnectionService.selectedEvaluation),
      map(log => (log[this.vbsServerConnectionService.selectedEvaluation!] ?? {})[this.vbsServerConnectionService.currentTaskState$.value?.taskId!] ?? []),
      filter(log => log));

    submissionLogSuccessCount$ = this.submissionLog$.pipe(
      map(log => log.filter((entry: any) => entry.success).length)
    );

    submissionLogWrongCount$ = this.submissionLog$.pipe(
      map(log => log.filter((entry: any) => entry.success === false && !entry.indeterminate && !entry.undecidable && !entry.requestError).length)
    );

    submissionLogPendingCount$ = this.submissionLog$.pipe(
      map(log => log.filter((entry: any) => entry.indeterminate || entry.undecidable).length)
    );

  currentTaskState$ = this.vbsServerConnectionService.currentTaskState$.pipe(
  );

  submissionLogRequestFailureCount$ = this.submissionLog$.pipe(
    map(log => log.filter((entry: any) => entry.requestError).length)
  );

  showTaskInfo$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MISC_SETTINGS]?.showTaskInfo ?? true),
  );

  logToDRES$ = this.settingsService.settings$.pipe(
    map((settings) => settings[SettingsService.LOCAL_MISC_SETTINGS]?.logToDRES?? true),
  );

  destroy$ = new Subject<void>();
  @ViewChild('topicInput') topicInput!: ElementRef;

    constructor(
      private globalConstants: GlobalConstantsService,
      public pythonServerService: PythonServerService,
      public vbsServerConnectionService: VBSServerConnectionService,
      private submissionLogService: SubmissionLogService,
      private shortcutService: ShortcutService,
      private settingsService: SettingsService
    ) { }

  ngOnInit() {
      this.shortcutService.isLockedEnterPressed.pipe(
          tap(value => {
              if (value) {
                this.submitTopic(this.topicInput.nativeElement);
                this.focusTopicInput(false);
              }
          }),
          takeUntil(this.destroy$)
      ).subscribe();
  }

  ngOnDestroy() {
      this.destroy$.next();
      this.destroy$.complete();
  }

  changeEvaluation(event: any) {
      this.vbsServerConnectionService.changeAndSaveSelectedEvaluation(event.target.value);
  }

  focusTopicInput(value: boolean) {
      console.log('focusTopicInput', value);
      this.shortcutService.lockEnter.next(value);
  }

  submitTopic(topicInput:any ) {
      console.log("submitTopic", topicInput);
      const inputVal = topicInput.value;
      console.log("submit value", inputVal);
      this.vbsServerConnectionService.submitText(inputVal);

      this.topicInput.nativeElement.value = '';
      this.topicInput.nativeElement.blur();
  }

  changeLogToDRES() {
    this.settingsService.addToSettingsEntry({
      logToDRES: !(this.settingsService.settings$.value[SettingsService.LOCAL_MISC_SETTINGS]?.logToDRES?? true)
    }, SettingsService.LOCAL_MISC_SETTINGS);
  }
}
