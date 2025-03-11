import express, { Router } from "express";
import { UserController } from '../controller/userController.ts'
import { userMiddleware} from '../middleware/userMiddleware.ts'

const router : Router = express.Router()

router.get('/', UserController.getUser);
router.post('/login', userMiddleware.validateLogin, UserController.loginUser);
router.post('/register', userMiddleware.validateRegister, UserController.registerUser);
router.get('/avatar', UserController.getAvatar);
router.post('/buy', UserController.buyPokeball);

export default router;