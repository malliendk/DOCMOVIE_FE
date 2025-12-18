export interface FileSystemItem {
  name: string;
  size?: string;
  type: 'file' | 'folder';
  extension?: string;
  lastModified?: string;
  isLoading?: boolean;
  path: string;
  children?: FileSystemItem[];
  isExpanded?: boolean;
  isSelected?: boolean;
  level?: number;
}
