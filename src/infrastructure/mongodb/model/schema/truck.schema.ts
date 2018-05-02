import { Document, Schema } from 'mongoose';

export interface ITruckDocument extends Document {
  container: {
    number: string;
    product: {
      name: string;
      type: string;
    };
  };
  licensePlate: string;
}

export const TruckSchema = new Schema({
  container: {
    number: String,
    product: {
      name: String,
      type: String
    }
  },
  licensePlate: String
});
