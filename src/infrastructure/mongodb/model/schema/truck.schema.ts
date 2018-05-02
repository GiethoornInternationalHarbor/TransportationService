import { Document, Schema } from 'mongoose';
import { TruckStatus } from '../../../../domain/truckStatus';

export interface ITruckDocument extends Document {
  container: {
    number: string;
    product: {
      name: string;
      type: string;
    };
  };
  licensePlate: string;
  status: TruckStatus;
}

export const TruckSchema = new Schema({
  container: {
    number: String,
    product: {
      name: String,
      type: String
    }
  },
  licensePlate: String,
  status: TruckStatus
});
