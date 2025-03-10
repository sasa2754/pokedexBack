import  express, { Router } from "express";
import { PokemonController } from "../controller/pokemonController.ts";

const router : Router = express.Router();

router.get('/', PokemonController.getAllPokemons);
router.get('/random', PokemonController.getOnePokemon);

export default router;