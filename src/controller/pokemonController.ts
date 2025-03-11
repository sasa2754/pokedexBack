import { AppError } from "../error/appError.ts";
import { prisma } from "../lib/prisma.ts";
import { PokemonService } from "../service/pokemonService.ts"
import { Request, Response } from "express"

export class PokemonController {
    static getAllPokemons = async (req: Request, res: Response) => {
        const pokemons = await PokemonService.getAllPokemons1();

        console.log(pokemons)

        res.status(200).json(pokemons);
    }

    static getOnePokemon = async (req: Request, res: Response) => {
        const pokemon = await PokemonService.getOnePokeRandom();
        res.status(200).json(pokemon);

    }

    static huntPokemon = async (req: Request, res: Response) => {
        const { pokeName, pokeballName } = req.body;
        const token = req.headers.authorization;

        if (!pokeName || !pokeballName)
            throw new AppError("Campos nulos!", 400);

        if (!token)
            throw new AppError("Token não recebido!", 400);

        const pokemon = await PokemonService.getPokeToName(pokeName.toString());

        const pokeball = await prisma.pokeball.findFirst({
            where: { name: pokeballName }
        });

        console.log(pokeball);

        if (!pokemon)
            throw new AppError("Pokemon não encontrado!", 404);

        if (!pokeball)
            throw new AppError("Pokeball não encontrado!", 404);


        const capture = await PokemonService.huntPokemon(pokemon, pokeball, token);

        if (capture)
            res.status(200).json({ response: true })
        else
            res.status(200).json({ response: false })

    }
}