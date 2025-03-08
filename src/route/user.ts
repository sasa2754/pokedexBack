import express, { Router } from "express";
import { UserController } from '../controller/userController.ts'
import { userMiddleware} from '../middleware/userMiddleware.ts'

const router : Router = express.Router()

router.get('/', userMiddleware.getUserMid, UserController.getUser);
router.post('/login', userMiddleware.validateLogin, UserController.loginUser);
router.post('/register', userMiddleware.validateRegister, UserController.registerUser);

export default router;