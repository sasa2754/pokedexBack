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
                id: data.id,
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
            throw new Error("Erro ao chamar os dados da API! Pokemon não existe!");
        }
    }

    static getOnePokeRandom = async () => {
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

    static huntPokemon = async (pokemon: Pokemon, pokeball: Pokeball, token: string) => {
        const chanceBase = (pokemon.base_experience + pokemon.hp) / (pokemon.defense + pokemon.attack + pokemon.speed);
        const chanceCapture = chanceBase * (pokeball.capture_percentual / 100);
        const randomFactor = Math.floor(Math.random() * 31);
        const percent = Math.min(Math.max(chanceCapture * randomFactor * 100, 1), 100);


        const tokenRight = token.split(" ")[1];
    
        if (!process.env.SECRET)
            throw new Error("Internal Server Error!");
    
        const decoded = jwt.verify(tokenRight, process.env.SECRET) as { id: number };
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    
        if (!user)
            throw new AppError("Usuário não encontrado!", 404);

        const userPokeball = await prisma.userPokeball.findFirst({
            where: {
                userId: user.id,
                pokeballId: pokeball.id,
            }
        });

        if (!userPokeball || userPokeball.amount <= 0)
            throw new AppError("Você não tem mais Pokébolas dessa categoria!", 400);

        await prisma.userPokeball.update({
            where: {
                id: userPokeball.id,
            },
            data: {
                amount: userPokeball.amount - 1,
            },
        });

        const exists = await prisma.pokemon.findFirst({ where : { id: pokemon.id } });

        if (!exists) {
            await prisma.pokemon.create({
                data: {
                    id: pokemon.id,
                    name: pokemon.name,
                    base_experience: pokemon.base_experience,
                    hp: pokemon.hp,
                    attack: pokemon.attack,
                    defense: pokemon.defense,
                    speed: pokemon.speed,
                    image: pokemon.image,
                    imageShiny: pokemon.imageShiny,
                    crie: pokemon.crie
                }
            })
        }
    
        const random = Math.random() * 50;
    
        if (random <= percent) {
            await prisma.pokedex.create({
                data: {
                    userId: user.id,
                    pokemonId: pokemon.id
                }
            });

            const coinUser = (pokemon.hp + pokemon.attack + pokemon.defense + pokemon.speed) / 10;

            await prisma.user.update({
                where : {
                    id: user.id,
                },
                data: {
                    money: user.money + coinUser
                }
            });
            
            console.log("✅ Pokémon capturado!");
            return true;
        } else {
            console.log("❌ Pokémon escapou!");
            return false;
        }
    };
}