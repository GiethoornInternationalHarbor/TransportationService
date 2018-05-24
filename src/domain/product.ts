import { BasicModel, Model } from 'objectmodel';
import { ProductType } from './productType';

export class Product extends Model({
  name: String,
  productType: BasicModel(Number).assert(n => n in ProductType)
}) {}
