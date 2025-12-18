import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CompressionObject} from '../DTO/CompressionObject';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  retrieveAllFiles(path: string) {
    console.log('retrieving from path: ', path)
    return this.http.get(path, { responseType: 'text' });
  }

  compressAndSaveFiles(compressionObject: CompressionObject) {
    console.log('writing to path: {}', compressionObject.targetDirectoryPath);
    return this.http.post<CompressionObject>('http://localhost:8080/api/files/convertToMp4', compressionObject);
  }
}
