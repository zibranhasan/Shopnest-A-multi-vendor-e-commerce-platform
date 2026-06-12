export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}
