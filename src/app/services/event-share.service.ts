import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class EventShareService {
  private subject: Subject<any> = new Subject<any>();

  send(evt): void{
    this.subject.next({event:evt})
  }

  recieve(): Observable<any>{
    return this.subject.asObservable();
  }

}
