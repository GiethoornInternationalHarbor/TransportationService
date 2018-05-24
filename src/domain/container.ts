import { ArrayModel, BasicModel, Model } from 'objectmodel';
import { ContainerType } from './containerType';
import { Product } from './product';
import { ProductType } from './productType';

export class Container extends Model({
  serialShippingContainerCode: String,
  containerType: BasicModel(Number).assert(n => n in ContainerType),
  products: ArrayModel(Product)
}) {}
