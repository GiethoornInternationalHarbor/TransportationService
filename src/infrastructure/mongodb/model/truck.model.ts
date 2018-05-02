import { Document, Model, model, Schema } from 'mongoose';
import { ITruckDocument, TruckSchema } from './schema/truck.schema';

export interface ITruckModel extends Model<ITruckDocument> {}
export const Truck = model<ITruckDocument, ITruckModel>('Truck', TruckSchema);

export default Truck;
