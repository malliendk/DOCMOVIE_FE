import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {

  constructor(private http: HttpClient) { }

  // connect(machineName: string, userName: string, password: string, port: number) {
  //   return this.http.post()
  // }
}
