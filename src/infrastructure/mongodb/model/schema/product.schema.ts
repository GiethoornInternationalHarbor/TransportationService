import { Document, Schema } from 'mongoose';

export const ProductSchema = new Schema({
  name: String,
  productType: {
    type: Number,
    required: true
  }
});
