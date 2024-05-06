const travellers = [
    {
        "name": "Riebeck",
        "location-slug": "brittle-hollow",
    },
    {
        "name": "Feldspar",
        "location-slug": "dark-bramble",
    },
    {
        "name": "Gabbro",
        "location-slug": "giants-deep",
    },
    {
        "name": "Chert",
        "location-slug": "hourglass-twins",
    },
    {
        "name": "Esker",
        "location-slug": "timber-hearth",
    },
    {
        "name": "Solanum",
        "location-slug": "quantum-moon",
    },
    {
        "name": "Prisoner",
        "location-slug": "the-stranger",
    },
];

function getTravellerIndex(name) {
    for(let i = 0; i < travellers.length; ++i) {
        if(travellers[i]["name"].toLowerCase() == name.toLowerCase()) {
            return i;
        }
    }
    return -1;
}

let numAudiosReady = 0;
let isFirstVolumeInteraction = true;
let allAudiosSetup = false;

const audios = travellers.map(info => {
    return new Audio(`./music/${info["name"]}.mp3`);
})

function setup() {
    audios.forEach(audio => {
        audio.loop = true;
        audio.volume = 0;
        
        audio.oncanplay = () => {
            if(allAudiosSetup) return;
    
            numAudiosReady++;
            if (numAudiosReady == travellers.length) {
                allAudiosSetup = true;
                allAudiosReady();
            }
        }
    })
    setupTravellerCards();
}

/**
 * Creates a card for each traveller
 * Calls setupTravellerAudios
 */
function setupTravellerCards() {
    const container = document.querySelector(".traveller-grid");
    console.log(container);

    let containerInnerHTML = "";
    for(const info of travellers) {
        containerInnerHTML += getTravellerCardHTML(info);
    }
    container.innerHTML = containerInnerHTML;

    setupTravellerAudios();
}

function getTravellerCardHTML(info) {
    const name = info["name"];

    embedTravellerSVG(info);
    
    return `
    <div class="traveller-card" data-traveller-name="${name}">
        <div class="traveller-card__inner">
            <div class="traveller-card__icon" data-traveller-name="${name}"></div>
            <div class="traveller-card__audio">
                <input type="range" data-traveller-name="${name}" class="volume-range-input" min="0" max="100" value="0">
            </div>
        </div>
    </div>
    `.trim()
}

async function embedTravellerSVG(info) {
    const url = `assets/planet-svgs/${info["location-slug"]}.svg`;
    const svg = await fetch(url).then(res => res.text());
    const name = info["name"];
    document.querySelector(`.traveller-card__icon[data-traveller-name="${name}"]`).innerHTML = svg;
}

function setupTravellerAudios() {
    document.querySelectorAll(".volume-range-input").forEach(input => {
        input.oninput = event => {
            const travellerName = input.getAttribute("data-traveller-name");
            const percent = input.value;
            setVolume(travellerName, percent);
        }
    })
}

function setVolume(travellerName, percent) {
    if(isFirstVolumeInteraction) {
        playAllAudios();
        isFirstVolumeInteraction = false;
    }

    let travellerIndex = getTravellerIndex(travellerName);

    const audio = audios[travellerIndex];
    audio.volume = percent / 100;

    // Add effects to the traveller icon
    document.querySelector(`.traveller-card[data-traveller-name="${travellerName}"]`).style.setProperty("--fraction", percent / 100);
}

setup();

// TODO: Switching tabs seemingly causes the browser to pause muted audios
// Switch to a play-only-on-press model
// Synchronize the played audio with an already playing audio
function allAudiosReady() {
    console.log("All audios are ready!");
}

function playAllAudios() {
    console.log("breh");
    for(const audio of audios) {
        audio.play();
    }
}

function sync() {
    console.log("Syncing audios");
    for(const audio of audios) {
        audio.currentTime = audios[0].currentTime;
    }
}
