export interface Pokemon {
    id: number;
    name: string;
    base_experience: number;
    hp: number;
    attack: number;
    defense: number;
    speed: number;
    image: string;
    imageBack: string;
    imageShiny: string;
    imageBackShiny: string;
    crie: string;
    isShiny: boolean;
}

export interface getAllPokemonApi {
    pokemon_species: {
        name: String
    }
}

export interface PokemonSpecies {
    name: string;
    url: string;
}

export interface GenerationResponse {
    pokemon_species: PokemonSpecies[];
}
