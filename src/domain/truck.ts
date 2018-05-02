import { Model } from 'objectmodel';
import { Container } from './container';

export class Truck extends Model({
  container: [Container],
  licensePlate: String
}) {}
