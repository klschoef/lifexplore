import {Component, DoCheck, Input, KeyValueDiffers, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {QueryPart, QueryPartType, Subquery, SubqueryType} from '../../models/query-part';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-query-part-element',
  templateUrl: './query-part-element.component.html',
  styleUrls: ['./query-part-element.component.scss']
})
export class QueryPartElementComponent implements OnDestroy {
  @Input() queryPart!: QueryPart;

  // use form group just for validation. The update itself will be handled by two-way binding.
  formGroup = new FormGroup({
    query: new FormControl('', [Validators.required]),
  });
  destroy$ = new Subject<void>();

  get queryControl() { return this.formGroup.get('query'); }
  private differ: any;

  constructor(private differs: KeyValueDiffers) {
    this.differ = this.differs.find({}).create();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  updateFormWithCurrentObject() {
    this.formGroup.patchValue({query: this.queryPart.query});
  }

  selectQueryType(queryType: QueryPartType) {
    if (this.queryPart) {
      this.queryPart.query_type = queryType;
    }
  }

  addSubquery() {
    if (!this.queryPart.subqueries) {
      this.queryPart.subqueries = [];
    }
    this.queryPart.subqueries.push({
      query_type: SubqueryType.score,
      query: ''
    });
  }

  deleteSubquery(subquery: Subquery) {
    if (this.queryPart.subqueries) {
      this.queryPart.subqueries = this.queryPart.subqueries.filter(s => s !== subquery);
    }
  }
}
