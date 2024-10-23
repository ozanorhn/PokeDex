function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getPokemonImageUrl(pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

function getTypeColor(type) {
    let typeColors = {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        ice: '#98D8D8',
        fighting: '#C03028',
        poison: '#A040A0',
        ground: '#E0C068',
        flying: '#A890F0',
        psychic: '#F85888',
        bug: '#A8B820',
        rock: '#B8A038',
        ghost: '#705898',
        dragon: '#7038F8',
        dark: '#705848',
        steel: '#B8B8D0',
        fairy: '#EE99AC',
        default: '#68A090'
    };
    return typeColors[type] || typeColors.default;
}

function fetchPokemonData(pokemonId) {
    return fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`)
        .then(function (response) {
            if (!response.ok) throw new Error('Pokémon nicht gefunden');
            return response.json();
        });
}

function fetchPokemonSpecies(speciesUrl) {
    return fetch(speciesUrl)
        .then(function (response) {
            return response.json();
        });
}

function getSpeciesName(generaArray) {
    for (let genusInfo of generaArray) {
        if (genusInfo.language.name === 'en') {
            return genusInfo.genus;
        }
    }
    return '';
}

function getAbilitiesList(abilitiesArray) {
    return abilitiesArray.map(function (a) {
        return a.ability.name;
    }).join(', ');
}

function loadPokemonData(pokemonId) {
    return fetchPokemonData(pokemonId);
}

async function fetchEvolutionChain(pokemonId) {
    const speciesData = await fetchPokemonSpecies(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`);
    const evolutionResponse = await fetch(speciesData.evolution_chain.url);
    const evolutionData = await evolutionResponse.json();
    return evolutionData.chain;
}

async function processEvolutionChain(evolution) {
    let evolutionChain = [];

    do {
        const speciesName = evolution.species.name;
        const speciesInfoData = await fetchPokemonData(speciesName);
        evolutionChain.push({
            name: speciesName,
            id: speciesInfoData.id
        });
        evolution = evolution.evolves_to[0];
    } while (evolution && evolution.hasOwnProperty('evolves_to'));

    return evolutionChain;
}

async function getEvolutionChain(pokemonId) {
    const evolution = await fetchEvolutionChain(pokemonId);
    const evolutionChain = await processEvolutionChain(evolution);
    return evolutionChain;
}

