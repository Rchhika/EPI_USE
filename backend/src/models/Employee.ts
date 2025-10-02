import mongoose, { Schema, Document, Model } from 'mongoose';

export interface EmployeeDocument extends Document {
  firstName: string;
  surname: string;
  email: string;
  birthDate?: Date;
  employeeNumber: string; // canonical, stored UPPERCASE
  salary?: number;
  role: string;
  manager?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    surname:   { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    birthDate: { type: Date },

    // Normalize and enforce uniqueness here
    employeeNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,         // "emp1" and "EMP1" become identical
      unique: true,
      index: true,
    },

    salary:   { type: Number },
    role:     { type: String, required: true, trim: true },
    manager:  { type: Schema.Types.ObjectId, ref: 'Employee', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Explicit index (good for existing clusters / re-syncs)
EmployeeSchema.index({ employeeNumber: 1 }, { unique: true });

export const Employee: Model<EmployeeDocument> =
  mongoose.models.Employee || mongoose.model<EmployeeDocument>('Employee', EmployeeSchema);
