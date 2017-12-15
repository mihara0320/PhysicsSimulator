import { TestBed, inject } from '@angular/core/testing';

import { EventShareService } from './event-share.service';

describe('EventShareService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventShareService]
    });
  });

  it('should be created', inject([EventShareService], (service: EventShareService) => {
    expect(service).toBeTruthy();
  }));
});
