import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges, OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {QueryPart, QueryPartType, Subquery} from '../../models/query-part';
import {BehaviorSubject, Subject, takeUntil} from 'rxjs';

export interface QueryPartInputProperties {
  placeholder?: string;
  type?: string;
  helpText?: string;
  min?: number;
  max?: number;
  step?: number;
}

@Component({
  selector: 'app-query-part-presenter-element',
  templateUrl: './query-part-presenter-element.component.html',
  styleUrls: ['./query-part-presenter-element.component.scss']
})
export class QueryPartPresenterElementComponent implements OnChanges, OnInit, OnDestroy {
  @Input() queryPart!: QueryPart;
  @Output() onDelete: EventEmitter<QueryPart> = new EventEmitter<QueryPart>();
  @Input() inputProperties: QueryPartInputProperties = {};

  @ViewChild('inputField') inputField?: ElementRef;
  @ViewChild('inputFieldWithHelp') inputFieldWithHelp?: ElementRef;

  openDetailContainer$ = new BehaviorSubject<boolean>(false);
  openTypeSelection$ = new BehaviorSubject<boolean>(false);

  destroy$ = new Subject<void>();

  ngOnInit() {
    this.openTypeSelection$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value) => {
      if (!value) {
        this.inputField?.nativeElement.focus();
        this.inputFieldWithHelp?.nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['queryPart']) {
      if (this.queryPart.open_selection) {
        this.openTypeSelection$.next(true);
        this.queryPart.open_selection = false;
      }
    }
  }

  openDetail() {
    this.openDetailContainer$.next(true);
  }

  openTypeSelection() {
    this.openTypeSelection$.next(true);
  }

  clickDelete() {
    this.onDelete.emit(this.queryPart);
  }

  deleteSubquery(subQuery: Subquery) {
    this.queryPart.subqueries = this.queryPart.subqueries?.filter(qp => qp !== subQuery);
  }

  selectQueryType(type: QueryPartType) {
    this.queryPart.query_type = type;
    this.openTypeSelection$.next(false);
  }
}
