function getAboutInfoHtml(species, height, weight, abilities) {
    return `
        <li><strong>Species:</strong> ${species}</li>
        <li><strong>Height:</strong> ${height} m</li>
        <li><strong>Weight:</strong> ${weight} kg</li>
        <li><strong>Abilities:</strong> ${abilities}</li>
    `;
}

function getStatRowHtml(stat) {
    let statName = stat.stat.name.toLowerCase();
    let displayName = capitalizeFirstLetter(statName.replace('-', ' '));
    let baseStat = stat.base_stat;
    let statPercent = (baseStat / 150) * 100;
    let statClass = statName.replace('-', '');

    return `
        <div class="stat-row">
            <span class="stat-name">${displayName}</span>
            <div class="stat-bar-container">
                <div class="stat-bar ${statClass}" style="width: ${statPercent}%;">
                </div>
                <span class="stat-value">${baseStat}</span>
            </div>
        </div>
    `;
}

function getPokemonCardHtml(pokemon) {
    return `
        <img class="card-img" src="${getPokemonImageUrl(pokemon.id)}" alt="${pokemon.name}">
        <div class="card-body">
            <h5 class="card-title">${capitalizeFirstLetter(pokemon.name)}</h5>
            <p class="card-text">#${String(pokemon.id).padStart(3, '0')}</p>
            ${getTypeBadgesHtml(pokemon.types)}
        </div>
    `;
}

