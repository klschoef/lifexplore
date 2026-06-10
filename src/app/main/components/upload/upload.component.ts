import {Component, ElementRef, ViewChild} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ConfigService} from '../../../shared/config/services/config.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef;
  selectedFiles?: FileList;
  errors = [];
  success = '';

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  onFileSelected(event: any): void {
    this.selectedFiles = event.target.files;
  }

  upload(): void {
    if (this.selectedFiles) {
      const formData = new FormData();
      Array.from(this.selectedFiles).forEach(file => formData.append('file', file));

      const uploadURL = this.configService.getConfiguration().config_UPLOAD_URL;

      this.http.post(uploadURL, formData, {responseType: 'json'})
        .subscribe({
          next: (response) => console.log(response),
          error: (error: HttpErrorResponse) => {
            console.error('Upload error:', error);
            this.errors = error.error.messages;
            this.success = '';
          },
          complete: () => {
            this.success = 'Upload successful, please check the analysis server logs for the current process, or try to fetch the new images in a few minutes';
            this.errors = [];
            this.fileInput.nativeElement.value = '';
            this.selectedFiles = undefined;
          }
        });
    }
  }
}
