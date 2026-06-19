export interface IReview {
  _id: string;
  product: string;
  customer: {
    _id: string;
    name: string;
    picture?: string;
  };
  order: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
}

export interface IReviewBreakdown {
  _id: number;   // star rating (1-5)
  count: number;
}

export interface IReviewSummary {
  avgRating: number;
  totalReviews: number;
  breakdown: IReviewBreakdown[];
}
