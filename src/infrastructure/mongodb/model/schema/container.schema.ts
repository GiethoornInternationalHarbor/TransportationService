import { Document, Schema } from 'mongoose';
import { ProductSchema } from './product.schema';

export const ContainerSchema = new Schema({
  serialShippingContainerCode: String,
  product: [ProductSchema],
  containerType: {
    type: Number,
    required: true
  }
});
