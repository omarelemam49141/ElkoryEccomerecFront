import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WebInfoService } from '../../../services/WebInfo.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SuccessSnackbarComponent } from '../../notifications/success-snackbar/success-snackbar.component';
import { FailedSnackbarComponent } from '../../notifications/failed-snackbar/failed-snackbar.component';
import { IAddWebInfo } from '../../../Models/i-add-web-info';
import { IWebInfo } from '../../../Models/IwebsiteInfo';
import { FileService } from '../../../services/file.service';
import { CommonModule } from '@angular/common';
import { SecondarySpinnerComponent } from '../../secondary-spinner/secondary-spinner.component';

@Component({
  selector: 'app-edit-website-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, SecondarySpinnerComponent],
  templateUrl: './edit-website-info.component.html',
  styleUrl: './../../customer-account/customer-account.scss'
})
export class EditWebsiteInfoComponent implements OnInit, OnDestroy{
  //editFormInfo
  webInfoToEdit?: IAddWebInfo;
  webSiteImage?: string;

  //form properties
  webInfoForm!: FormGroup;

  //notification properties
  notificationDurationInSeconds = 5;

  //subscriptions properties
  subscriptions: Subscription[] = [];

  //spinners notifications
  isWebsiteInfoLoading: boolean = false;

  constructor(private snackBar: MatSnackBar,
    private webInfoService: WebInfoService,
    private fb: FormBuilder,
    private fileService: FileService
  ) {

  }

  //start life cycle hooks
  ngOnInit(): void {
    this.createWebInfoForm();
    this.getWebInfoIfExist();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe())
  }
  //end life cycle hooks

  mapWebInfoModelToAddWebInfoModel(webInfoModel: IWebInfo) {
    this.fileService.urlToFile(webInfoModel.webLogoImageUrl, 'webLogo', 'image/png').then((file) => {
      this.webInfoToEdit = {
        webPhone: webInfoModel.webPhone,
        webName: webInfoModel.webName,
        webLogo: file,
        instagramAccount: webInfoModel.instagramAccount,
        facebookAccount: webInfoModel.facebookAccount,
        description: webInfoModel.description,
        storeAddress: webInfoModel.storeAddress,
        CustomerServicePhone: webInfoModel.customerServicePhone
      }

      this.createWebInfoForm();

      this.addImageToForm(webInfoModel.webLogoImageUrl);
    })
  }

  addImageToForm(imageUrl: string) {
    this.webSiteImage = imageUrl;
    if (imageUrl) {
      //get the image name from the image url
      let imageName: string = imageUrl.split('/').pop()!;
      let mimeType: string = imageUrl.split(';')[0].split(':')[1];
      this.fileService.urlToFile(imageUrl, imageName, mimeType).then(file=> {
        this.webInfoForm.get("webLogo")?.setValue(file);
      });
    }
  }

  async getWebInfoIfExist() {
    this.isWebsiteInfoLoading = true;
    this.subscriptions.push(this.webInfoService.getWebInfo().subscribe({
      next: (data) => {
        if (data) {
          this.mapWebInfoModelToAddWebInfoModel(data);
        }
        this.isWebsiteInfoLoading = false;
      },
      error: (err) => {
        this.snackBar.openFromComponent(FailedSnackbarComponent, {
          data: 'تعذر جلب معلومات الموقع',
          duration: this.notificationDurationInSeconds * 1000
        })
        this.isWebsiteInfoLoading = false;
      }
    }))
  }

  //methods
  onFileSelected(event: any): void {
    //convert the file to binary
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      // Check if the selected file is an image
      if (file.type.startsWith('image/')) {
        this.webInfoForm.get("webLogo")?.setValue(file);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e: any) => {
          this.webSiteImage = e.target.result;
        };
      } else {
        // If the selected file is not an image, clear the file input
        input.value = ''; // Clear the file input
        this.webSiteImage = '';
      }
    }

  }

  createWebInfoForm() {
    this.webInfoForm = this.fb.group({
      webPhone: [this.webInfoToEdit?.webPhone, [Validators.required]],
      webName: [this.webInfoToEdit?.webName, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      webLogo: ['', [Validators.required]],
      instagramAccount: [this.webInfoToEdit?.instagramAccount, [Validators.required, Validators.minLength(2)]],
      facebookAccount: [this.webInfoToEdit?.facebookAccount, [Validators.required, Validators.minLength(2)]],
      description: [this.webInfoToEdit?.description, [Validators.required, Validators.minLength(2)]],
      storeAddress: [this.webInfoToEdit?.storeAddress, [Validators.required, Validators.minLength(2)]],
      CustomerServicePhone: [this.webInfoToEdit?.CustomerServicePhone, [Validators.required, Validators.pattern("^(010|011|012|015)\\d{8}$")]],
    })
  }

  addNewWebInfo() {
    this.isWebsiteInfoLoading = true;
    this.webInfoService.addWebInfo(this.webInfoForm.value).subscribe({
      next: (data) => {
        this.isWebsiteInfoLoading = false;
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: 'تم حقظ معلومات الموقع بنجاح',
          duration: this.notificationDurationInSeconds * 1000
        })
        this.getWebInfoIfExist();
      },
      error: (err) => {
        console.log(err)
        this.isWebsiteInfoLoading = false;
        this.snackBar.openFromComponent(FailedSnackbarComponent, {
          data: 'تعذر حفظ معلومات الموقع',
          duration: this.notificationDurationInSeconds * 1000
        })
      }
    })
  }

  updateWebInfo() {
    this.isWebsiteInfoLoading = true;
    this.webInfoService.updateWebInfo(this.webInfoForm.value).subscribe({
      next: (data) => {
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: 'تم تحديث معلومات الموقع بنجاح',
          duration: this.notificationDurationInSeconds * 1000
        })
        this.isWebsiteInfoLoading = false;
      },
      error: (err) => {
        console.log(err)
        this.snackBar.openFromComponent(FailedSnackbarComponent, {
          data: 'تعذر تحديث معلومات الموقع',
          duration: this.notificationDurationInSeconds * 1000
        })
        this.isWebsiteInfoLoading = false;
      }
    })
  }

  submitWebInfoForm() {
    if (this.webInfoForm.valid) {
      if (!this.webInfoToEdit) {
        this.addNewWebInfo();
      } else {
        this.updateWebInfo();
      }
    }
  }

  get webName() {
    return this.webInfoForm.get("webName");
  }

  get webLogo() {
    return this.webInfoForm.get("webLogo");
  }

  get webPhone() {
    return this.webInfoForm.get("webPhone");
  }

  get instagramAccount() {
    return this.webInfoForm.get("instagramAccount");
  }

  get facebookAccount() {
    return this.webInfoForm.get("facebookAccount");
  }

  get description() {
    return this.webInfoForm.get("description");
  }

  get storeAddress() {
    return this.webInfoForm.get("storeAddress");
  }

  get CustomerServicePhone() {
    return this.webInfoForm.get("CustomerServicePhone");
  }
}
