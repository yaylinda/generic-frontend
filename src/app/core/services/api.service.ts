import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { catchError } from 'rxjs/operators/catchError';

@Injectable()
export class ApiService {

  constructor(private http: HttpClient) {}

  get(
    path: string, 
    sessionToken: string = null): Observable<any> {

      let headers = {};
      if (sessionToken !== null) {
        headers = { 'Session-Token': sessionToken };
      }

      console.log("GET request...");
      console.log("path =", path);
      console.log("headers =", headers);
      
      return this.http.get(`${environment.api_url}${path}`, { headers: headers })
        .pipe(catchError(this.formatErrors));
  }

  put(
    path: string, 
    body: Object = {}, 
    sessionToken: string = null): Observable<any> {

      let headers = {};
      if (sessionToken !== null) {
        headers = { 'Session-Token': sessionToken };
      }

      return this.http.put(`${environment.api_url}${path}`,JSON.stringify(body), { headers: headers })
        .pipe(catchError(this.formatErrors));
  }

  post(
    path: string, 
    body: Object = {},
    sessionToken: string = null): Observable<any> {

      let headers = {};
      if (sessionToken !== null) {
        headers = { 'Session-Token': sessionToken };
      }

      console.log('posting to: ' + path);
      console.log(body);

      return this.http.post(`${environment.api_url}${path}`, JSON.stringify(body), { headers: headers })
        .pipe(catchError(this.formatErrors));
  }

  delete(
    path,
    sessionToken: string = null): Observable<any> {

      let headers = {};
      if (sessionToken !== null) {
        headers = { 'Session-Token': sessionToken };
      }

      return this.http.delete(`${environment.api_url}${path}`, { headers: headers })
        .pipe(catchError(this.formatErrors));
  }

  private formatErrors(error: any) {
    console.log(error);
    return new ErrorObservable(error.error);
  }
}
