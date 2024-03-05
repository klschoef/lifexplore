import { TestBed } from '@angular/core/testing';

import { VbsserverConnectionService } from './vbsserver-connection.service';

describe('VbsserverConnectionService', () => {
  let service: VbsserverConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VbsserverConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
