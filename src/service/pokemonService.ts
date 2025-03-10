import axios from "axios";
import { GenerationResponse, getAllPokemonApi, Pokemon, PokemonSpecies } from "../dto/PokemonDto.ts";
import { AppError } from "../error/appError.ts";
import jwt from 'jsonwebtoken';
import { prisma } from "../lib/prisma.ts";
import { Pokeball } from "../dto/PokeballDto.ts";



export class PokemonService {
    static getAllPokemons1 = async () => {
        try {
            const response = await axios.get<GenerationResponse>("https://pokeapi.co/api/v2/generation/1");
            const pokemons = response.data;

            const pokemonNames: string[] = pokemons.pokemon_species.map((pokemon: PokemonSpecies) => pokemon.name);

            return pokemonNames;
        } catch (error) {
            throw new Error("Erro ao chamar os dados da API!");
        }
    };


    static getPokeToName = async ( name: string ) => {
        try {
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data = response.data;

            const stats = data.stats.reduce((acc: any, stat: any) => {
                if (["hp", "attack", "defense", "speed"].includes(stat.stat.name)) {
                  acc[stat.stat.name] = stat.base_stat;
                }
                return acc;
              }, {});


            const pokeSend: Pokemon = {
                name: data.name,
                base_experience: data.base_experience,
                hp: stats.hp,
                attack: stats.attack,
                defense: stats.defense,
                speed: stats.speed,
                image: data.sprites.front_default,
                imageShiny: data.sprites.front_shiny,
                crie: data.cries.latest
            };

            return pokeSend;
            
        } catch (error) {
            console.log(error);
            throw new Error("Erro ao chamar os dados da API!");
        }
    }

    static getOnePokeRandom = async ( token : string ) => {
        try {
            if (!process.env.SECRET)
                throw new Error("Internal Server Error!");

            try {
                const responseAll = await this.getAllPokemons1();
                
                const pokemon = responseAll[Math.floor(Math.random() * responseAll.length)];

                const pokeSend = this.getPokeToName(pokemon);

                return pokeSend;
            } catch (error) {
                console.log(error);
                throw new Error("Erro ao chamar os dados da API!");
            }
            
        } catch (error) {
            console.log(error);
            throw new Error("Internal Server Error!");
        }
    }

    static huntPokemon = async ( pokemon : Pokemon, pokeball : Pokeball, token : string ) => {

    }
}