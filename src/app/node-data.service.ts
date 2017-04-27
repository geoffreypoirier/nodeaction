import {Injectable} from '@angular/core';
import {Headers, Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Node} from './node';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class NodeDataService {

  private SERVER_URL = 'http://localhost:8080/nodes';


  private updateString = new Subject<string>();
  updateString$ = this.updateString.asObservable();


  private headers = new Headers({'Content-Type': 'application/json'});


  constructor(private http: Http) {
  }

  getNodes(req): Observable<Node[]> {
    return this.http.get(this.SERVER_URL + '?address=' + req.address + '&depth=' + req.depth)
      .map((res) => res.json())
      .catch((error: any) => Observable.throw('error:', error));
  }

}
