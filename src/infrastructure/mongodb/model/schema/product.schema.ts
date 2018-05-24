import { Document, Schema } from 'mongoose';

export const ProductSchema = new Schema({
  name: String,
  type: {
    type: Number,
    required: true
  }
});
