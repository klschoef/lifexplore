import { TestBed } from '@angular/core/testing';

import { QueryEventLogService } from './query-event-log.service';

describe('QueryEventLogService', () => {
  let service: QueryEventLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QueryEventLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
