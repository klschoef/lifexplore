import { TestBed } from '@angular/core/testing';

import { NodeserverConnectionService } from './nodeserver-connection.service';

describe('NodeserverConnectionService', () => {
  let service: NodeserverConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NodeserverConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
