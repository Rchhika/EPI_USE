import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Employee } from '../models/Employee';

const toObjectId = (v: any) => (v ? new mongoose.Types.ObjectId(String(v)) : null);
const toDate = (v: any) => (v ? new Date(v) : undefined);
const canonEmpNo = (v: any) => String(v ?? '').trim().toUpperCase();
const canonEmail = (v: any) => String(v ?? '').trim().toLowerCase();
const trim = (v: any) => String(v ?? '').trim();

const sanitizeSort = (s: string) => (/^-?[a-zA-Z0-9_.]+$/.test(s) ? s : '-createdAt');

// -------------------- LIST --------------------
export async function listEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const sort  = sanitizeSort(String(req.query.sort || '-createdAt'));
    const q     = String(req.query.q || '').trim();

    const filter = q
      ? {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { surname:   { $regex: q, $options: 'i' } },
            { email:     { $regex: q, $options: 'i' } },
            { role:      { $regex: q, $options: 'i' } },
            { employeeNumber: { $regex: q, $options: 'i' } },
            // Add combined name search for full names like "John Doe"
            { $expr: { 
                $regexMatch: { 
                  input: { $concat: ["$firstName", " ", "$surname"] }, 
                  regex: q, 
                  options: "i" 
                } 
              } 
            },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      Employee.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Employee.countDocuments(filter),
    ]);

    res.json({ data, total, page, limit });
  } catch (e) { next(e); }
}

// -------------------- LIST ALL FOR ORG CHART --------------------
export async function listAllEmployeesForOrg(req: Request, res: Response, next: NextFunction) {
  try {
    // Get all employees with minimal fields for org chart
    const employees = await Employee.find({})
      .select('_id firstName surname email role employeeNumber manager createdAt')
      .sort({ role: 1, createdAt: 1 })
      .lean();

    // Process employees to handle manager references and validate data
    const processedEmployees = employees.map(emp => {
      const processed = {
        id: emp._id.toString(),
        name: emp.firstName,
        surname: emp.surname,
        email: emp.email,
        role: emp.role,
        employeeNumber: emp.employeeNumber,
        manager: null as string | null,
        createdAt: emp.createdAt,
      };

      // Handle manager field - convert ObjectId to employeeNumber if needed
      if (emp.manager) {
        // If manager is an ObjectId, we need to find the corresponding employeeNumber
        if (mongoose.Types.ObjectId.isValid(emp.manager)) {
          const managerEmp = employees.find(e => e._id.toString() === emp.manager?.toString());
          if (managerEmp) {
            processed.manager = managerEmp.employeeNumber;
          }
        } else {
          // If manager is already an employeeNumber, use it directly
          processed.manager = String(emp.manager);
        }
      }

      // Validate: never allow manager === own employeeNumber
      if (processed.manager === processed.employeeNumber) {
        processed.manager = null;
      }

      return processed;
    });

    res.json(processedEmployees);
  } catch (e) { next(e); }
}

// -------------------- GET BY ID --------------------
export async function getEmployeeById(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await Employee.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Employee not found' });
    res.json(doc);
  } catch (e) { next(e); }
}

// -------------------- CREATE --------------------
export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    let {
      firstName,
      surname,
      email,
      birthDate,
      employeeNumber,
      salary,
      role,
      manager,
      isActive,
    } = req.body;

    // Normalize
    firstName      = trim(firstName);
    surname        = trim(surname);
    email          = canonEmail(email);
    employeeNumber = canonEmpNo(employeeNumber);
    role           = trim(role);
    manager        = manager ? String(manager) : '';

    if (!firstName || !surname || !email || !employeeNumber || !role) {
      return res.status(400).json({
        message: 'firstName, surname, email, employeeNumber and role are required',
      });
    }

    // Pre-check duplicates (still catch 11000 as fallback)
    const [emailDupe, empNoDupe] = await Promise.all([
      Employee.findOne({ email }).lean(),
      Employee.findOne({ employeeNumber }).lean(),
    ]);
    if (emailDupe) return res.status(409).json({ message: 'Email already exists' });
    if (empNoDupe) return res.status(409).json({ message: 'Employee number already exists' });

    const doc = await Employee.create({
      firstName,
      surname,
      email,
      birthDate: toDate(birthDate),
      employeeNumber,   // already canonical uppercase
      salary,
      role,
      manager: manager ? toObjectId(manager) : null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json(doc);
  } catch (e: any) {
    if (e?.code === 11000) {
      if (e?.keyPattern?.email)          return res.status(409).json({ message: 'Email already exists' });
      if (e?.keyPattern?.employeeNumber) return res.status(409).json({ message: 'Employee number already exists' });
    }
    next(e);
  }
}

// -------------------- UPDATE --------------------
export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const update: any = {};
    const b = req.body ?? {};

    if ('firstName' in b)       update.firstName      = trim(b.firstName);
    if ('surname' in b)         update.surname        = trim(b.surname);
    if ('email' in b)           update.email          = canonEmail(b.email);
    if ('birthDate' in b)       update.birthDate      = b.birthDate ? toDate(b.birthDate) : undefined;
    if ('employeeNumber' in b)  update.employeeNumber = canonEmpNo(b.employeeNumber);
    if ('salary' in b)          update.salary         = b.salary;
    if ('role' in b)            update.role           = trim(b.role);
    if ('manager' in b)         update.manager        = b.manager ? toObjectId(b.manager) : null;
    if ('isActive' in b)        update.isActive       = !!b.isActive;

    // Pre-check duplicates only if the field is being changed
    if (update.email) {
      const dupe = await Employee.findOne({ email: update.email, _id: { $ne: id } }).lean();
      if (dupe) return res.status(409).json({ message: 'Email already exists' });
    }
    if (update.employeeNumber) {
      const dupe = await Employee.findOne({ employeeNumber: update.employeeNumber, _id: { $ne: id } }).lean();
      if (dupe) return res.status(409).json({ message: 'Employee number already exists' });
    }
    // controllers/employee.controller.ts (inside update handler, before updating)
    if (update.manager && String(update.manager) === String(req.params.id)) {
      return res.status(400).json({ message: 'Employee cannot be their own manager.' });
    }

  
    const doc = await Employee.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!doc) return res.status(404).json({ message: 'Employee not found' });
    res.json(doc);
  } catch (e: any) {
    if (e?.code === 11000) {
      if (e?.keyPattern?.email)          return res.status(409).json({ message: 'Email already exists' });
      if (e?.keyPattern?.employeeNumber) return res.status(409).json({ message: 'Employee number already exists' });
    }
    next(e);
  }
}

// -------------------- DELETE --------------------
export async function deleteEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await Employee.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Employee not found' });
    res.status(204).send();
  } catch (e) { next(e); }
}
