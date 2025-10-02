import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface EmployeeDocument extends Document {
  firstName: string;
  surname: string;
  email: string;
  birthDate?: Date;
  employeeNumber: string; // canonical, stored UPPERCASE
  salary?: number;
  role: string;
  manager?: Types.ObjectId | null;
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
      uppercase: true,           // "emp1" and "EMP1" become identical
      unique: true,
      index: true,
    },

    salary:   { type: Number },
    role:     { type: String, required: true, trim: true },

    // Prevent self as manager on create/save
    manager: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      validate: {
        validator: function (this: EmployeeDocument, v: Types.ObjectId | null) {
          if (!v) return true; // no manager is allowed
          // _id exists during validation; disallow self
          return this._id?.toString() !== v.toString();
        },
        message: 'Employee cannot be their own manager.',
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Explicit indexes (nice for existing clusters / re-syncs)
EmployeeSchema.index({ employeeNumber: 1 }, { unique: true });
EmployeeSchema.index({ email: 1 }, { unique: true });

// Also block self-as-manager during atomic updates
EmployeeSchema.pre('findOneAndUpdate', function () {
  const update: any = this.getUpdate() || {};
  // Updates may come as {$set: {manager: ...}} or direct {manager: ...}
  const set = update.$set ?? update;
  const newManager = set?.manager;
  if (!newManager) return;

  const q = this.getQuery() as any;
  const targetId = (q._id ?? q.id)?.toString();
  if (!targetId) return;

  if (newManager.toString() === targetId) {
    throw new Error('Employee cannot be their own manager.');
  }
});

export const Employee: Model<EmployeeDocument> =
  mongoose.models.Employee || mongoose.model<EmployeeDocument>('Employee', EmployeeSchema);
