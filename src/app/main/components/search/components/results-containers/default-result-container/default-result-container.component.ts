import {
  AfterViewInit,
  Component, ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import {map, skip} from 'rxjs/operators';
import {ResultPresenterService} from '../../../../../services/result-presenter.service';
import {BehaviorSubject, filter, Subject, takeUntil, tap} from 'rxjs';
import {ResultDetailComponentMode} from '../../result-detail/result-detail.component';
import {ShortcutService} from '../../../../../services/shortcut.service';

@Component({
  selector: 'app-default-result-container',
  templateUrl: './default-result-container.component.html',
  styleUrls: ['./default-result-container.component.scss']
})
export class DefaultResultContainerComponent implements OnInit, OnDestroy, AfterViewInit, OnChanges  {
  @Input() results: any[] = [];
  @Input() previousPageTrigger$ = new BehaviorSubject(undefined);
  @Input() nextPageTrigger$ = new BehaviorSubject(undefined);
  @Input() openPageTrigger$ = new BehaviorSubject<number | undefined>(undefined);
  @Input() lockEscapeInParent$?: BehaviorSubject<boolean>;
  openSelectedResultInDetail$ = new BehaviorSubject<boolean>(false);
  openNewResultTrigger$ = new BehaviorSubject(undefined);
  selectedResult$ = new BehaviorSubject<any>(undefined);
  disableControls$ = new BehaviorSubject<boolean>(false); //to disable navigation like when we have another result open
  pageSwitchFlag = 0; // 0: no page switch, 1: next page, -1: previous page
  destroy$ = new Subject<void>();

  @ViewChildren('resultElement') resultElements!: QueryList<ElementRef>;


  constructor(
    private resultPresenterService: ResultPresenterService,
    public shortcutService: ShortcutService,
  ) {

  }

  ngOnInit() {
    this.shortcutService.isArrowRightPressed.pipe(
      skip(1),
      filter(val => val === true && !this.disableControls$.value),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // get array id of current selected result in results array
      const currentResultId = this.results.findIndex(result => result === this.selectedResult$.value);
      console.log("right pressed: ", currentResultId);
      if (currentResultId < this.results.length - 1) { // if we can go to the next result
        this.pageSwitchFlag = 0;
        this.selectedResult$.next(this.results[currentResultId + 1]);
      } else {
        this.pageSwitchFlag = 1;
        this.nextPageTrigger$.next(undefined);
      }
    });

    this.shortcutService.isArrowLeftPressed.pipe(
      skip(1),
      filter(val => val === false && !this.disableControls$.value),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      // get array id of current selected result in results array
      const currentResultId = this.results.findIndex(result => result === this.selectedResult$.value);
      console.log("left pressed: ", currentResultId);
      if (currentResultId > 0) { // if we can go to the prev result
        this.pageSwitchFlag = 0;
        this.selectedResult$.next(this.results[currentResultId - 1]);
      } else {
        this.pageSwitchFlag = -1;
        this.previousPageTrigger$.next(undefined);
      }
    });

    this.shortcutService.isNumberPressed.pipe(
      skip(1),
      filter(val => val !== undefined && !this.disableControls$.value),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      // get array id of current selected result in results array
      this.pageSwitchFlag = 0;
      this.openPageTrigger$.next(value);
    });

    this.shortcutService.isTabPressed.pipe(
      skip(1),
      filter(val => val),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      // get array id of current selected result in results array
      this.pageSwitchFlag = 0;
      this.nextPageTrigger$.next(undefined);
    });

    this.shortcutService.isTabShiftPressed.pipe(
      skip(1),
      filter(val => val),
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      // get array id of current selected result in results array
      this.pageSwitchFlag = 0;
      this.previousPageTrigger$.next(undefined);
    });

    this.shortcutService.isEscapePressed.pipe(
      skip(1),
      filter(val => val === false && !this.disableControls$.value),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.openSelectedResultInDetail$.next(false);
    });

    this.shortcutService.isSpacePressed.pipe(
      skip(1),
      filter(val => val === false && !this.disableControls$.value),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.results.length > 0) {
        if (!this.selectedResult$.value) {
          this.selectedResult$.next(this.results[0]);
        }
        this.openCurrentDetail();
      }
    });

    this.openSelectedResultInDetail$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((val) => {
      this.lockEscapeInParent$?.next(val);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit() {
    this.selectedResult$.pipe(
      tap(selectedResult => this.scrollToSelected(selectedResult)),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['results']) {
      if (this.pageSwitchFlag === 1) {
        this.selectedResult$.next(this.results[0]);
      } else if (this.pageSwitchFlag === -1) {
        this.selectedResult$.next(this.results[this.results.length - 1]);
      } else {
        if (this.results.length > 0) {
          this.selectedResult$.next(this.results[0]);
        }
      }
      this.pageSwitchFlag = 0;
    }
  }

  private scrollToSelected(selectedResult: any) {
    const resultIndex = this.results.findIndex(result => result === selectedResult);
    if (resultIndex < 0) {
      return;
    }
    const element = this.resultElements.find((element, index) => index === resultIndex);

    if (element) {
      element.nativeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }

  clickResult(result: any) {
    console.log("result", result);
    this.selectedResult$.next(result);
    this.openCurrentDetail();
  }

  openCurrentDetail() {
    this.openNewResultTrigger$.next(this.selectedResult$.value);
    this.openSelectedResultInDetail$.next(true);
  }
}
