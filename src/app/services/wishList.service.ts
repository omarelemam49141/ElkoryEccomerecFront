import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { IwishList } from '../Models/IwishList';
import { IAddWishListProduct } from '../Models/Iadd-wishListproduct';
import { GenericService } from './generic.service';
import { IwhishListProduct } from '../Models/IwishListProduct';
import { IProduct } from '../Models/iproduct';

@Injectable({
  providedIn: 'root'
})
export class WishListService {
  private apiUrl = `${environment.apiUrl}/WishList`;

  constructor(private http: HttpClient) {}

  getWishList(userid:number): Observable<IProduct[]> {
    return this.http.get<IProduct[]>(this.apiUrl+"/"+userid);
  }
  addWishListProduct(wishListProduct: IAddWishListProduct): Observable<any>
   { return this.http.post<any>(this.apiUrl, wishListProduct); }

  deleteWishList( userID:number): Observable<any> {
    return this.http.delete<any>(this.apiUrl+"/"+userID);
  }
  deleteWishListProduct(userID:number, productID:number): Observable<any> {
    return this.http.delete<any>(this.apiUrl+"/"+userID+"/"+productID);
  }


}
