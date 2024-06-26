import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ICart } from '../../../Models/icart';
import { CartService } from '../../../services/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { FailedSnackbarComponent } from '../../notifications/failed-snackbar/failed-snackbar.component';
import { SuccessSnackbarComponent } from '../../notifications/success-snackbar/success-snackbar.component';
import { AccountService } from '../../../services/account.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IProduct } from '../../../Models/iproduct';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SendOrderComponent } from '../send-order/send-order.component';

@Component({
  selector: 'app-products-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './products-cart.component.html',
  styleUrl: './products-cart.component.scss'
})
export class ProductsCartComponent implements OnDestroy, OnInit{
  cart!: ICart;
  cartChanged = false;

  //notifications
  notificationDurationInSeconds = 5;

  //subscriptions
  subscriptions: Subscription[] = [];

  constructor(private cartService: CartService,
    private snackBar: MatSnackBar,
    private accountService: AccountService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  //observers
  getCartObserver = {
    next: (data: ICart) => {
      if (data?.productsAmounts) {
        localStorage.setItem("cart", JSON.stringify(data));
        this.cart = data
      }
    },
    error: (err: Error) => {
      this.snackBar.openFromComponent(FailedSnackbarComponent, {
        data: "تعذر تحميل العربة!",
        duration: this.notificationDurationInSeconds * 1000
      })
    }
  }

  deleteCartObserver = {
    next: (data: ICart) => {
      this.loadCart();
    },
    error: (err: Error) => {
      this.snackBar.openFromComponent(FailedSnackbarComponent, {
        data: "تعذر حذف العربة!",
        duration: this.notificationDurationInSeconds * 1000
      })
    }
  }

  updateCartObserver = {
    next: (data: ICart) => {
      this.snackBar.openFromComponent(SuccessSnackbarComponent, {
        data: " تم تعديل العربة بنجاح!",
        duration: this.notificationDurationInSeconds * 1000
      })
    },
    error: (err: Error) => {
      this.snackBar.openFromComponent(FailedSnackbarComponent, {
        data: "تعذر تعديل العربة!",
        duration: this.notificationDurationInSeconds * 1000
      })
    }
  }
  //end observers
  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    if (localStorage.getItem("cart")) {
      this.cart = JSON.parse(localStorage.getItem("cart")!);
    } else {
      let token = JSON.stringify(localStorage.getItem('token'));
      if (!token) {
        this.router.navigate(['/customer-account/login']);
      } else {
        let userId = this.accountService.getIdFromToken(token);
        this.subscriptions.push(this.cartService.displayCart(userId).subscribe(this.getCartObserver))
      }
    }
  }

  updateLocalStorageWithCart() {
    this.cartChanged = true;
    this.changeCartItemsAmount();
    localStorage.setItem('cart', JSON.stringify(this.cart));
  }

  changeCartItemsAmount() {
    this.cart.numberOfUniqueProducts = this.cart.productsAmounts.length;
    this.cart.numberOfProducts = 0;
    this.cart.productsAmounts.forEach(product => {
      this.cart.numberOfProducts += product.amount;
    })
    this.changeCartNotificationNumber(this.cart.numberOfUniqueProducts);
  }

  changeCartNotificationNumber(amountOfItemsInCart: number) {
    this.cartService.changeNumberOfItemsInCart(amountOfItemsInCart);
  }

  calculateCartFinalPrice() {
    this.cart.finalPrice = 0;
    for (let i = 0; i < this.cart.productsAmounts.length; i++) {
      this.cart.finalPrice += this.cart.productsAmounts[i].finalPrice * this.cart.productsAmounts[i].amount;
    }
    this.updateLocalStorageWithCart();
  }

  validateSelectedPRoductAmount(product: IProduct, productAmount: number): boolean {
    let notValid = false;
    if (productAmount < 1) {
      product.amount = 1;
      notValid = true;
    } else if (productAmount > product.allAmount!) {
      product.amount = product.allAmount!;
      notValid = true;
    } 
    return notValid;
  }

  decreaseOrIncreaseProductAmount(product: IProduct, productAmount: number): void {
    if(this.validateSelectedPRoductAmount(product, productAmount)){
      return;
    }
    if(productAmount > product.amount){
      this.cart.numberOfProducts += productAmount - product.amount;
      this.cart.finalPrice += product.finalPrice * (productAmount - product.amount);
    }
    else{
      this.cart.numberOfProducts -= product.amount - productAmount;
      this.cart.finalPrice -= product.finalPrice * (product.amount - productAmount);
    }

    product.amount = productAmount;
    this.updateProductAmountInCart(product);
    this.calculateCartFinalPrice();
  }

  updateProductAmountInCart(product: IProduct) {
    let productIndexInCart = this.cart.productsAmounts.findIndex(prod=>prod.productId == product.productId);
    this.cart.productsAmounts.splice(productIndexInCart, 1, product);
  }

  updateProductAmount(product: IProduct, event: any): void {
    if(this.validateSelectedPRoductAmount(product, +event.target.value)){
      return;
    }

    this.decreaseOrIncreaseProductAmount(product, +event.target.value);
  }

  updateProductAmountWithProuctId(product: IProduct, productAmount: number): void {
    if(this.validateSelectedPRoductAmount(product, productAmount)){
      return;
    }

    this.decreaseOrIncreaseProductAmount(product, productAmount);
  }

  clearCart(): void {
    localStorage.removeItem("cart");
    this.cart = {} as ICart;
    this.changeCartNotificationNumber(0)
    let token = localStorage.getItem('token');
    if (token) {
      let userId = this.accountService.getIdFromToken(token);
      this.subscriptions.push(this.cartService.deleteCart(userId).subscribe(this.deleteCartObserver));
    }
  }

  updateCart(isOrderOpen: boolean = false): void {
    if (isOrderOpen) {
      this.cartService.updateCart(this.cart).subscribe({
        next: (data: ICart) => {
          this.router.navigate(['/customer-products/confirm-order']);
        },
        error: (err: Error) => {
          console.log(err)
          this.snackBar.openFromComponent(FailedSnackbarComponent, {
            data: "تعذر تعديل العربة!",
            duration: this.notificationDurationInSeconds * 1000
          })
        }
      });
    } else {
      this.cartService.updateCart(this.cart).subscribe(this.updateCartObserver);
    }
  }

  deleteProductFromCart(productId: number): void {
    //get the product from productsAmounts array
    let product = this.cart.productsAmounts.find(p => p.productId == productId);
    
if(product){
    this.cart.productsAmounts = this.cart.productsAmounts.filter(p => p.productId != productId);
    this.cart.numberOfUniqueProducts--;
    this.cart.numberOfProducts -= product.amount;
    this.cart.finalPrice -= product.finalPrice * product.amount;
    this.updateLocalStorageWithCart();
    if (this.cart.productsAmounts.length == 0) {
      this.clearCart();
    } else {
    this.cartService.updateCart(this.cart).subscribe(this.updateCartObserver);
    }
  }
  }

  openSendOrder() {
    let dialogRef: MatDialogRef<SendOrderComponent> = this.dialog.open(SendOrderComponent, {
    })

    dialogRef.afterClosed().subscribe(data => {
      if (data) {
        this.clearCart();
        this.snackBar.openFromComponent(SuccessSnackbarComponent, {
          data: "تم ارسال الطلب بنجاح!",
          duration: this.notificationDurationInSeconds * 1000
        })
      }
    })
  }

  ngOnDestroy(): void {
    if (this.cartChanged) {
      this.updateCart();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
