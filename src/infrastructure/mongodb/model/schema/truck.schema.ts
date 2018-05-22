import { Document, Schema } from 'mongoose';
import { Truck } from '../../../../domain/truck';
import { TruckStatus } from '../../../../domain/truckStatus';
import { ContainerSchema } from './container.schema';

export interface ITruckDocument extends Truck, Document {}

export const TruckSchema = new Schema({
  container: ContainerSchema,
  licensePlate: String,
  status: {
    type: Number,
    required: true,
    default: TruckStatus.UNKNOWN
  }
});
