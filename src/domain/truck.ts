import { BasicModel, Model } from 'objectmodel';
import { Container } from './container';
import { TruckStatus } from './truckStatus';

export class Truck extends Model({
  container: [Container],
  licensePlate: String,
  status: BasicModel(Number).assert(n => n in TruckStatus)
}) {
  public container?: Container;
  public licensePlate: string;
  public status: TruckStatus;
}

Truck.defaults({
  status: TruckStatus.UNKNOWN
});
