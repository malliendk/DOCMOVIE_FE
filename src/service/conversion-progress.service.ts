import { Injectable } from '@angular/core';
import {ConversionProgressEvent} from '../dto/ConversionProgressEvent';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConversionProgressService {

  constructor() { }

  subscribeToProgress(): Observable<ConversionProgressEvent> {
    return new Observable(observer => {
      const eventSource = new EventSource('/api/conversion/progress');

      eventSource.addEventListener('conversion-progress', (event: MessageEvent) => {
        const data: ConversionProgressEvent = JSON.parse(event.data);
        observer.next(data);
      });

      eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        observer.error(error);
        eventSource.close();
      };

      // Cleanup function
      return () => {
        eventSource.close();
      };
    });
  }

}
