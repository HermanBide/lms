import { Router, Request, Response, NextFunction } from 'express'
import { activateUser, registerUser } from '../controllers/authController'

const router = Router()

router.post('/register', registerUser);
router.post('/activate_user', activateUser);

export default router;