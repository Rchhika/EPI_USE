import { Request, Response, NextFunction } from 'express';
import { Employee } from '../models/Employee';

export async function listEmployees(req: Request, res: Response, next: NextFunction) {
  try {
    const page  = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10));
    const sort  = String(req.query.sort || '-createdAt');
    const q     = String(req.query.q || '').trim();

    const filter = q
      ? {
          $or: [
            { firstName: { $regex: q, $options: 'i' } },
            { surname:   { $regex: q, $options: 'i' } },
            { email:     { $regex: q, $options: 'i' } },
            { role:      { $regex: q, $options: 'i' } },
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

export async function getEmployeeById(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await Employee.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Employee not found' });
    res.json(doc);
  } catch (e) { next(e); }
}

export async function createEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, surname, email, birthDate, employeeNumber, salary, role, manager, isActive } = req.body;
    if (!firstName || !surname || !email) {
      return res.status(400).json({ message: 'firstName, surname and email are required' });
    }
    const exists = await Employee.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(409).json({ message: 'Email already exists' });

    const doc = await Employee.create({
      firstName, surname, email, birthDate, employeeNumber, salary, role, manager, isActive,
    });
    res.status(201).json(doc);
  } catch (e) { next(e); }
}

export async function updateEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const update = { ...req.body };
    if (update.email) {
      const dupe = await Employee.findOne({ email: String(update.email).toLowerCase(), _id: { $ne: req.params.id } });
      if (dupe) return res.status(409).json({ message: 'Email already exists' });
    }
    const doc = await Employee.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!doc) return res.status(404).json({ message: 'Employee not found' });
    res.json(doc);
  } catch (e) { next(e); }
}

export async function deleteEmployee(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await Employee.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Employee not found' });
    res.status(204).send();
  } catch (e) { next(e); }
}
