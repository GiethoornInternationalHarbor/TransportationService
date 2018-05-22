import { Document, Schema } from 'mongoose';
import { ProductSchema } from './product.schema';

export const ContainerSchema = new Schema({
  number: String,
  product: ProductSchema
});
