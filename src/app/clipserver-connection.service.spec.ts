import { TestBed } from '@angular/core/testing';

import { ClipserverConnectionService } from './clipserver-connection.service';

describe('ClipserverConnectionService', () => {
  let service: ClipserverConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClipserverConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
