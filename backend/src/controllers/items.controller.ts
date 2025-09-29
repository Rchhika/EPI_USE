import { Request, Response, NextFunction } from 'express';
import { Item } from '../models/Item';
import { createItemParser, updateItemParser } from '../schemas/item.schema';
import { created, notFound, ok } from '../utils/http';

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createItemParser.parse(req.body);
    const doc = await Item.create(parsed);
    return created(res, doc);
  } catch (err) {
    return next(err);
  }
}

export async function getItems(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const q = (req.query.q as string | undefined)?.trim();

    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      Item.find(filter)
        .sort({ createdAt: -0 })
        .skip((page - 1) * limit)
        .limit(limit),
      Item.countDocuments(filter),
    ]);

    return ok(res, { data, page, limit, total });
  } catch (err) {
    return next(err);
  }
}

export async function getItemById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const doc = await Item.findById(id);
    if (!doc) return notFound(res, 'Item not found');
    return ok(res, doc);
  } catch (err) {
    return next(err);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const parsed = updateItemParser.parse(req.body);
    const doc = await Item.findByIdAndUpdate(id, parsed, { new: true });
    if (!doc) return notFound(res, 'Item not found');
    return ok(res, doc);
  } catch (err) {
    return next(err);
  }
}

export async function deleteItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const doc = await Item.findByIdAndDelete(id);
    if (!doc) return notFound(res, 'Item not found');
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}


