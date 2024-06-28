import { Component } from '@angular/core';
import { IRate } from '../../../Models/irate';
import { ReviewService } from '../../../services/review.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar as faSolidStar, faStar as faEmptyStar } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-add-review',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, FontAwesomeModule],
  templateUrl: './add-review.component.html',
  styleUrl: './add-review.component.scss'
})
export class AddReviewComponent {
  rate: IRate = {
    productId: 0,
    customerId: 0,
    numOfStars: 0,
    comment: '',
    rateDate: new Date()
  };


  hoverRating: number = 0;
  faSolidStar = faSolidStar;
  faEmptyStar = faEmptyStar;

  constructor(private reviewService: ReviewService) {}

  addReview(): void {
    // let finalDate = this.getFinalDate();
    // this.rate.rateDate = finalDate;
    // console.log(this.rate);

    this.reviewService.addReview(this.rate).subscribe((data) => {
      console.log(data);
    });
  }

  // getFinalDate(): string {
  //   const now = new Date();
  //   const year = now.getFullYear();
  //   let month = (now.getMonth() + 1).toString().padStart(2, '0'); // Adding 1 because getMonth() returns zero-based index
  //   let day = now.getDate().toString().padStart(2, '0');
  //   return `${day}-${month}-${year}`;
  // }

}
