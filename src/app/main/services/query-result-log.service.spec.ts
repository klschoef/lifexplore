import { TestBed } from '@angular/core/testing';

import { QueryResultLogService } from './query-result-log.service';

describe('QueryResultLogService', () => {
  let service: QueryResultLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryResultLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
