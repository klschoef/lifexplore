import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {QueryPart} from '../../models/query-part';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-query-part-element',
  templateUrl: './query-part-element.component.html',
  styleUrls: ['./query-part-element.component.scss']
})
export class QueryPartElementComponent implements OnInit, OnDestroy {
  @Input() queryPart?: QueryPart;

  formGroup = new FormGroup({
    query: new FormControl('', [Validators.required]),
  });
  destroy$ = new Subject<void>();

  get queryControl() { return this.formGroup.get('query'); }

  ngOnInit() {
    this.formGroup.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      if (this.formGroup.valid && this.queryPart) {
        this.queryPart.query = this.queryControl?.value ?? undefined;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
