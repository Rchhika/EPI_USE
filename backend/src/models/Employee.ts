import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EmployeeDocument extends Document {
  firstName: string;
  surname: string;
  email: string;
  birthDate?: Date;
  employeeNumber?: string;
  salary?: number;
  role?: 'Employee' | 'Manager' | 'Admin' | string;
  manager?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    surname:   { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    birthDate: { type: Date },
    employeeNumber: { type: String },
    salary:    { type: Number, default: 0 },
    role:      { type: String, default: 'Employee' },
    manager:   { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

export const Employee: Model<EmployeeDocument> =
  mongoose.models.Employee || mongoose.model<EmployeeDocument>('Employee', EmployeeSchema);
