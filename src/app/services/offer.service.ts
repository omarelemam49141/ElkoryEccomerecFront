import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { IOfferProduct } from '../Models/ioffer-product';
import { environment } from '../../environment/environment';
import { GenericService } from './generic.service';
import { IOffer } from '../Models/ioffer';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  public handlingAddProductToOfferErrors(err: HttpErrorResponse) {
    if(err.status == 500) {
      return throwError(()=>new Error("هذا المنتج موجود ضمن العرض بالفعل"));
    }
    return throwError(()=>new Error("تعذر اضافة المنتج الى العرض"));
  }

  constructor(private http: HttpClient,
    private genericService: GenericService<IOfferProduct>
  ) { }

  public addProductToOffer(offerId: number, offerProduct: IOfferProduct): Observable<any> {
    this.genericService.addHeaders("Content-Type", "application/json");
    return this.http.post<any>(`${environment.apiUrl}/offers/${offerId}`, offerProduct, this.genericService.getHeaders()).pipe(
      retry(2),
      catchError(this.handlingAddProductToOfferErrors)
    );
  }

  public deleteProductFromOffer(offerId: number, productId: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/offers/${offerId}/products/${productId}`).pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }

  public updateProductOffer(offerId: number, productId: number, product: IOfferProduct): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/offers/${offerId}/${productId}`, product).pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }

  public updateOffer(offerToUpdate: FormData): Observable<any> {
    this.genericService.addHeaders("Content-Type", "multipart/form-data");
    return this.http.put<any>(`${environment.apiUrl}/Offers?offerId=${offerToUpdate.get("offerId")}`, offerToUpdate, this.genericService.getHeaders()).pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    )
  }

  public deleteOffer(offerId: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/offers/${offerId}`).pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    )
  }
  public getProductOffers(productId: number): Observable<IOffer[]> {
    return this.http.get<IOffer[]>(`${environment.apiUrl}/Offers/byProductId/${productId}`).pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }
}
