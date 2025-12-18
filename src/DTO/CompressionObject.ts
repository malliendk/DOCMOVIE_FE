import {FileSystemItem} from './FileSystemItem';

export interface CompressionObject {

  files: FileSystemItem[];
  targetDirectoryPath: string;
}
