import { Router, Request, Response, NextFunction } from 'express'
import { activateUser, loginUser, registerUser } from '../controllers/authController'

const router = Router()

router.post('/register', registerUser);
router.post('/activate_user', activateUser);
router.post('/login', loginUser)

export default router;