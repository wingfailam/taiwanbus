import { TestBed } from '@angular/core/testing';

import { TdxService } from './tdx.service';

describe('TdxService', () => {
  let service: TdxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TdxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
