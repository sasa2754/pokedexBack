import { AppError } from "../error/appError.ts";
import { PokemonService } from "../service/pokemonService.ts"
import { Request, Response } from "express"

export class PokemonController {
    static getAllPokemons = async (req: Request, res: Response) => {
        const pokemons = await PokemonService.getAllPokemons1();

        console.log(pokemons)

        res.status(200).json(pokemons);
    }

    static getOnePokemon = async (req: Request, res: Response) => {
        const token = req.headers.authorization;
        if (!token)
            throw new AppError("Token não recebido!", 400);

        const pokemon = await PokemonService.getOnePokeRandom(token);
        res.status(200).json(pokemon);

    }

    static huntPokemon = async (req: Request, res: Response) => {
        const { pokeName, pokeball } = req.params;
        const token = req.headers.authorization;

        if (!pokeName || !pokeball)
            throw new AppError("Campos nulos!", 400);

        if (!token)
            throw new AppError("Token não recebido!", 400);

        const pokemon = await PokemonService.getPokeToName(pokeName.toString());



        // Terminar de fazer a parte de caçar pokemon, preciso pegar a chance de caça da pokeball e diminuir com a chance do pokemon ser caçado, daí fazer ele ser ou não caçado, se for, adiciona no banco, se não for, só envia isso como resposta
        
        


    }
}