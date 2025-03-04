let currentPokemonId = 1;
let totalLoadedPokemon = 0;
let pokemonLoadLimit = 20;
let isDataLoading = false;
let totalAvailablePokemon = 1025;

let pokemonModal = new bootstrap.Modal(document.getElementById('pokemonModal'));

function init() {
    loadPokemon(pokemonLoadLimit);
    showLoadingScreen();
}

document.getElementById('prevButton').addEventListener('click', function () {
    if (currentPokemonId > 1) {
        showPokemonDetails(currentPokemonId - 1);
    }
});

document.getElementById('nextButton').addEventListener('click', function () {
    showPokemonDetails(currentPokemonId + 1);
});

async function loadPokemonData(pokemonId) {
    try {
        let response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        if (!response.ok) {
            throw new Error(`Fehler: Pokémon mit ID ${pokemonId} nicht gefunden`);
        }
        let pokemonData = await response.json();
        return pokemonData;
    } catch (error) {
        console.error("Fehler beim Laden des Pokémon:", error);
        return null;
    }
}

function showPokemonDetails(pokemonId) {
    fetchPokemonData(pokemonId)
        .then(function (pokemon) {
            updateModalContent(pokemon);
            currentPokemonId = pokemonId;
            pokemonModal.show();
        })
        .catch(function (error) {
            console.error('Fehler beim Abrufen der Pokémon-Details:', error);
            alert('Pokémon nicht gefunden. Bitte überprüfe die Schreibweise oder ID.');
        });
}

async function updateModalContent(pokemon) {
    document.getElementById('pokemonName').innerText = capitalizeFirstLetter(pokemon.name);
    document.getElementById('pokemonNumber').innerText = `#${String(pokemon.id).padStart(3, '0')}`;
    document.getElementById('modalPokemonImage').src = getPokemonImageUrl(pokemon.id);

    updatePokemonTypes(pokemon.types);
    updateCardHeaderColor(pokemon.types[0].type.name);
    updatePokemonStats(pokemon.stats);
    updateAboutInfo(pokemon);
    await updateEvolutionChain(pokemon.id);
}

function updatePokemonTypes(types) {
    let typesContainer = document.getElementById('pokemonTypes');
    typesContainer.innerHTML = '';
    types.forEach(function (typeInfo) {
        let typeSpan = createTypeSpan(typeInfo.type.name);
        typesContainer.appendChild(typeSpan);
    });
}

function updateCardHeaderColor(typeName) {
    let cardHeader = document.querySelector('.card-header');
    cardHeader.style.backgroundColor = getTypeColor(typeName.toLowerCase());
}

function updatePokemonStats(statsArray) {
    let statsInfo = document.getElementById('statsInfo');
    statsInfo.innerHTML = '';
    statsArray.forEach(function (stat) {
        statsInfo.innerHTML += getStatRowHtml(stat);
    });
}

function updateAboutInfo(pokemon) {
    fetchPokemonSpecies(pokemon.species.url)
        .then(function (speciesData) {
            let species = getSpeciesName(speciesData.genera);
            let height = pokemon.height / 10;
            let weight = pokemon.weight / 10;
            let abilities = getAbilitiesList(pokemon.abilities);
            let aboutInfo = document.getElementById('aboutInfo');
            aboutInfo.innerHTML = getAboutInfoHtml(species, height, weight, abilities);
        });
}

async function updateEvolutionChain(pokemonId) {
    const evolutionChain = await getEvolutionChain(pokemonId);
    const evolutionImagesDiv = document.getElementById('evolutionImages');
    evolutionImagesDiv.innerHTML = '';

    evolutionChain.forEach(function (species) {
        const img = createEvolutionImage(species.id, species.name);
        evolutionImagesDiv.appendChild(img);
    });
}

async function fetchPokemonBatch(startIndex, limit) {
    let pokemonBatch = [];

    for (let i = startIndex; i <= startIndex + limit - 1 && i <= totalAvailablePokemon; i++) {
        let pokemon = await loadPokemonData(i);
        pokemonBatch.push(pokemon);
    }

    return pokemonBatch;
}

function displayPokemonBatch(pokemonBatch) {
    let pokedexContainer = document.getElementById('pokedex');

    pokemonBatch.forEach(pokemon => {
        let pokemonCard = createPokemonCard(pokemon);
        pokedexContainer.appendChild(pokemonCard);
    });
}


async function loadPokemon(limit) {
    isDataLoading = true;
    toggleLoadMoreButton();
    showLoadingScreen();

    const startIndex = totalLoadedPokemon + 1;
    const pokemonBatch = await fetchPokemonBatch(startIndex, limit);
    displayPokemonBatch(pokemonBatch);

    totalLoadedPokemon += pokemonBatch.length;
    isDataLoading = false;
    toggleLoadMoreButton();
    hideLoadingScreen();
    initializeTabs();
}


function loadMorePokemon() {
    if (!isDataLoading) {
        loadPokemon(pokemonLoadLimit);
    }
}


function processPokemonCards(searchInput, pokemonCards) {
    let filteredCards = [];
    let visibleCount = 0;

    pokemonCards.forEach(function (card) {
        let pokemonName = card.querySelector('.card-title').innerText.toLowerCase();
        if (pokemonName.includes(searchInput) && visibleCount < 10) {
            filteredCards.push(card);
            visibleCount++;
        }
    });

    return filteredCards;
}

function togglePokemonCardsVisibility(pokemonCards, filteredCards) {
    pokemonCards.forEach(function (card) {
        if (filteredCards.includes(card)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
}

function filterPokemon() {
    let searchInput = document.getElementById('search').value.toLowerCase();
    let pokemonCards = document.querySelectorAll('#pokedex .col-lg-2, #pokedex .col-md-4, #pokedex .col-sm-6, #pokedex .col-12');

    if (searchInput.length >= 3) {
        let filteredCards = processPokemonCards(searchInput, pokemonCards);
        togglePokemonCardsVisibility(pokemonCards, filteredCards);
    } else {
        pokemonCards.forEach(function (card) {
            card.style.display = '';
        });
    }
}




function initializeTabs() {
    let tabs = document.querySelectorAll('.tab');
    let panes = document.querySelectorAll('.tab-pane');
    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.forEach(function (t) { t.classList.remove('active'); });
            panes.forEach(function (p) { p.classList.remove('active'); });
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });
}

function toggleLoadMoreButton() {
    let loadMoreBtn = document.getElementById('loadMoreBtn');
    loadMoreBtn.disabled = isDataLoading || totalLoadedPokemon >= totalAvailablePokemon;
}

function showLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.body.classList.add('no-scroll');
}

function hideLoadingScreen() {
    document.getElementById('loadingScreen').style.display = 'none';
    document.body.classList.remove('no-scroll');
}

function getTypeBadgesHtml(types) {
    return types.map(function (typeInfo) {
        return `<span class="badge ${typeInfo.type.name}">${capitalizeFirstLetter(typeInfo.type.name)}</span>`;
    }).join('');
}

function createTypeSpan(typeName) {
    let typeSpan = document.createElement('span');
    typeSpan.classList.add('type-icon', typeName.toLowerCase());
    typeSpan.innerText = capitalizeFirstLetter(typeName);
    return typeSpan;
}

function createEvolutionImage(pokemonId, pokemonName) {
    const img = document.createElement('img');
    img.src = getPokemonImageUrl(pokemonId);
    img.alt = pokemonName;
    img.classList.add('evolution-image');
    return img;
}

function createPokemonCard(pokemon) {
    let cardCol = document.createElement('div');
    cardCol.className = 'col-xl-custom col-lg-2 col-md-3 col-sm-4 col-6 mb-3';
    cardCol.addEventListener('click', function () {
        showPokemonDetails(pokemon.id);
    });

    let card = document.createElement('div');
    card.className = `card ${pokemon.types[0].type.name.toLowerCase()}`;
    card.innerHTML = getPokemonCardHtml(pokemon);
    cardCol.appendChild(card);

    return cardCol;
}