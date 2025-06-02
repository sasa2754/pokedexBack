import express, { Router } from "express";
import { BattleController } from "../controller/battleController.ts";

const router: Router = express.Router();

// Rotas de batalha
router.post('/select-pokemon', BattleController.selectPokemon);
router.post('/action', BattleController.performAction);
router.get('/:matchId', BattleController.getBattleStatus);
router.post('/surrender', BattleController.surrender);

export default router;