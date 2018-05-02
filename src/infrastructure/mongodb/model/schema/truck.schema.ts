import { Document, Schema } from 'mongoose';
import { Truck } from '../../../../domain/truck';
import { TruckStatus } from '../../../../domain/truckStatus';

export interface ITruckDocument extends Truck, Document {}

export const TruckSchema = new Schema({
  container: {
    number: String,
    product: {
      name: String,
      type: String
    }
  },
  licensePlate: String,
  status: {
    type: Number,
    required: true,
    default: TruckStatus.UNKNOWN
  }
});
