import { TestBed } from '@angular/core/testing';

import { InteractionLogService } from './interaction-log.service';

describe('InteractionLogService', () => {
  let service: InteractionLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionLogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
