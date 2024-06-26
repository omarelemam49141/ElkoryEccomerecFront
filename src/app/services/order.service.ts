import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, retry, throwError } from 'rxjs';
import { GenericService } from './generic.service';
import { IOrderModel } from '../Models/iorder-model';
import { IOrderModifiedPrice } from '../Models/iorder-modified-price';
import { environment } from '../../environment/environment';
import { IOrdersPaginated } from '../Models/iorders-paginated';
import { IOrdersStats } from '../Models/iorders-stats';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  constructor(private http: HttpClient,
    private genericService: GenericService<IOrderModel>
  ) { }

  public getOrderModifiedPrice(offerId: number, userId: number): Observable<IOrderModifiedPrice> {
    return this.http.get<IOrderModifiedPrice>(`${environment.apiUrl}/Order/GetFinalPriceDetails/${offerId}/${userId}`)
    .pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }

  public getCustomerPreviousOrders(userId: number, orderStatus: number, pageNumber: number, pageSize: number): Observable<IOrdersPaginated> {
    return this.http.get<IOrdersPaginated>(`${environment.apiUrl}/Order/GetUserOrdersByStatusPaginated?userId=${userId}&orderStatus=${orderStatus}&page=${pageNumber}&pageSize=${pageSize}`)
    .pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }

  public getAllCustomersOrdersPaginated(orderStatus: number, pageNumber: number, pageSize: number): Observable<IOrdersPaginated> {
    return this.http.get<IOrdersPaginated>(`${environment.apiUrl}/Order/GetOrdersByStatusPaginated?orderStatus=${orderStatus}&page=${pageNumber}&pageSize=${pageSize}`)
    .pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }

  public changeOrderStatus(orderId: string, orderStatus: number, shippingDurationInDays?: number): Observable<any> {
    switch (orderStatus) {
      case 1:
        return this.http.post<any>(`${environment.apiUrl}/Order/ChangeStatusAccepted?orderId=${orderId}`, null)
        .pipe(
          retry(2),
          catchError(this.genericService.handlingErrors)
        );
      case 2:
        return this.http.post<any>(`${environment.apiUrl}/Order/ChangeStatusShipped?orderId=${orderId}&arrivalInDays=${shippingDurationInDays}`, null)
        .pipe(
          retry(2),
          catchError(this.genericService.handlingErrors)
        );
      case 3:
        return this.http.post<any>(`${environment.apiUrl}/Order/ChangeStatusDelivered?orderId=${orderId}`, null)
        .pipe(
          retry(2),
          catchError(this.genericService.handlingErrors)
        );
      case 4:
        return this.http.post<any>(`${environment.apiUrl}/Order/ChangeStatusCancelled?orderId=${orderId}`, null)
        .pipe(
          retry(2),
          catchError(this.genericService.handlingErrors)
        );
    
      default:
        return throwError(()=>new Error("يجب عليك تحديد حالة الطلب"))
    }
    
  }

  public getUserOrdersStats(userId: number): Observable<IOrdersStats> {
    return this.http.get<IOrdersStats>(`${environment.apiUrl}/Order/GetOrderStatsByUserId?userId=${userId}`)
    .pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }

  public getAllOrdersStats() : Observable<IOrdersStats>{
    return this.http.get<IOrdersStats>(`${environment.apiUrl}/Order/GetOrderStats`)
    .pipe(
      retry(2),
      catchError(this.genericService.handlingErrors)
    );
  }
}
