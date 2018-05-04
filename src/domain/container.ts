import { Model } from 'objectmodel';

export class Container extends Model({
  number: String,
  product: {
    name: String,
    type: String
  }
}) {}
