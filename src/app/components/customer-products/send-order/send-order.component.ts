import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { IOrderModel } from '../../../Models/iorder-model';
import { AccountService } from '../../../services/account.service';
import { FailedSnackbarComponent } from '../../notifications/failed-snackbar/failed-snackbar.component';
import { GenericService } from '../../../services/generic.service';

@Component({
  selector: 'app-send-order',
  standalone: true,
  imports: [MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatOption,
    ReactiveFormsModule,
    CommonModule],
  templateUrl: './send-order.component.html',
  styleUrl: './send-order.component.scss'
})
export class SendOrderComponent implements OnDestroy{
  //form properties
  orderForm!: FormGroup;

  paymentMethods = [
    {
      id: 0,
      name: "الدفع عند التسليم"
    },
    {
      id: 1,
      name: "الدفع فى الفرع"
    },
    {
      id: 2,
      name: "الدفع ببطاقة الدفع"
    }
  ]

  //notifications properties
  notificationDurationInSeconds = 5;

  //subscriptions properties
  subscriptions: Subscription[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {userId: number, offerId: number},
    public dialogRef: MatDialogRef<SendOrderComponent>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private genericService: GenericService<IOrderModel>,
  ) {
    this.orderForm = this.fb.group({
      governerate: ['', [Validators.required]],
      city: ['', [Validators.required]],
      street: ['', [Validators.required]],
      postalCode: ['', [Validators.required]],
      paymentMethod: ['', [Validators.required]]
    })
  }
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  submitForm() {
    let orderModel: IOrderModel = this.orderForm.value as IOrderModel;
    orderModel.userId = this.data.userId;
    orderModel.offerId = this.data.offerId;
    this.subscriptions.push(this.genericService.insert("Order/ConfirmOrder", orderModel).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error:(err: Error) => {
        console.log(err);
        this.snackBar.openFromComponent(FailedSnackbarComponent, {
          data: "تعذر إرسال الطلب. الرجاء المحاولة مرة أخرى",
          duration: this.notificationDurationInSeconds * 1000
        })
      }
    }))
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  get governerate() {
    return this.orderForm.get("governerate");
  }
  get city() {
    return this.orderForm.get("city");
  }
  get street() {
    return this.orderForm.get("street");
  }
  get postalCode() {
    return this.orderForm.get("postalCode");
  }
  get paymentMethod() {
    return this.orderForm.get("paymentMethod");
  }
}
