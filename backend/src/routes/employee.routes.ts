import { Router } from 'express';
import { listEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee, listAllEmployeesForOrg } from '../controllers/employees.controller';
import { requireAuth } from '../middlewares/requireAuth'; // if you're protecting admin routes

const router = Router();

router.get('/', requireAuth, listEmployees);
router.get('/all-for-org', requireAuth, listAllEmployeesForOrg);
router.post('/', requireAuth, createEmployee);
router.get('/:id', requireAuth, getEmployeeById);
router.patch('/:id', requireAuth, updateEmployee);
router.delete('/:id', requireAuth, deleteEmployee);

export default router;
