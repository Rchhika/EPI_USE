import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ItemDocument extends Document {
  name: string;
  description: string;
  price: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ItemSchema = new Schema<ItemDocument>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const Item: Model<ItemDocument> = mongoose.models.Item || mongoose.model<ItemDocument>('Item', ItemSchema);


