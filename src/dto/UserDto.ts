import { Pokeball } from "./PokeballDto.ts";
import { Pokemon } from "./PokemonDto.ts";

export interface RegisterUserDto {
    name: string;
    email: string;
    birthday: Date;
    password: string;
    avatar: string;
}

export interface LoginUserDto {
    email: string;
    password: string;
}

export interface UserDto {
    id: number;
    name: string;
    email: string;
    birthday: Date;
    password: string;
    avatar: string;
    money: number;
    pokeballs: Pokeball[];
    pokemons: Pokemon[];
}