import  express, { Router } from "express";
import { MatchController } from "../controller/matchController.ts";


const router : Router = express.Router();

router.post('/', MatchController.matchmaking);

export default router;