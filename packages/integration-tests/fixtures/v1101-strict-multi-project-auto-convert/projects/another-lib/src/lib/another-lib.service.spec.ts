import { TestBed } from '@angular/core/testing';

import { AnotherLibService } from './another-lib.service';

describe('AnotherLibService', () => {
  let service: AnotherLibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnotherLibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
