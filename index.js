const travellers = [
    {
        "name": "Riebeck",
        "location-slug": "brittle-hollow",
        "bloom-color": "hsl(250, 100%, 50%)",
        "base-color": "hsl(250, 100%, 75%)",
    },
    {
        "name": "Feldspar",
        "location-slug": "dark-bramble",
        "bloom-color": "hsl(200, 100%, 50%)",
        "base-color": "hsl(200, 100%, 75%)",
    },
    {
        "name": "Gabbro",
        "location-slug": "giants-deep",
        "bloom-color": "hsl(150, 100%, 50%)",
        "base-color": "hsl(150, 100%, 75%)",
    },
    {
        "name": "Chert",
        "location-slug": "hourglass-twins",
        "bloom-color": "hsl(30, 100%, 50%)",
        "base-color": "hsl(30, 100%, 75%)",
    },
    {
        "name": "Esker",
        "location-slug": "timber-hearth",
        "bloom-color": "hsl(175, 100%, 50%)",
        "base-color": "hsl(175, 100%, 75%)",
    },
    {
        "name": "Solanum",
        "location-slug": "quantum-moon",
        "bloom-color": "hsl(50, 100%, 50%)",
        "base-color": "hsl(50, 100%, 75%)",
    },
    {
        "name": "Prisoner",
        "location-slug": "the-stranger",
        "bloom-color": "hsl(125, 75%, 50%)",
        "base-color": "hsl(125, 75%, 75%)",
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

let isPlaying = false;
let probeLaunchTime = -1;

let isFirstInteraction = true;

// Checks if the given audio has been interacted at least once before
// Useful for syncing this audio with the first one that is playing
const hasInteracted = new Array(travellers.length).fill(false);

const audios = travellers.map(info => {
    return new Audio(`./music/${info["name"]}.mp3`);
})

function setup() {
    audios.forEach(audio => {
        audio.loop = true;
        audio.volume = 0;
    })
    setupTravellerCards();
    setupMediaControls();
    startDeviationChecker();
    setupSupernova();
    setupKeyboardListener();
}

function setupKeyboardListener() {
    document.body.addEventListener("keypress", event => {
        const key = event.key;

        if(key === "s" || key === "S") {
            // Synchronize
            sync();
        } else if(key === "m") {
            // Volume 0
            setVolumeAll(0);
        } else if(key === "M") {
            // Volume 100
            setVolumeAll(100);
        } else if(key === "p" || key === "P") {
            // TODO: Remove duplicate code with onclick
            // Play / pause
            if(isPlaying) pauseAll();
            else playAll();
        }
    });
}

const EndTimesAudio = new Audio("./music/End Times (Trimmed).mp3");

function setupSupernova() {
    // Embed the supernova SVG
    embedSVG("./assets/supernova.svg", document.querySelector(".supernova-overlay"));

    const SupernovaCountdownMs = 22 * 60 * 1000; // 22 minutes
    // const SupernovaCountdownMs = 500; // (debug) Instant
    // const SupernovaCountdownMs = (60 + 30) * 1000; // (debug) Instant End Times

    const EndTimesDurationMs = (60 + 27) * 1000;
    
    // Play "End Times" to signal the supernova
    setTimeout(() => {
        EndTimesAudio.volume = 1;
        EndTimesAudio.play();
    }, SupernovaCountdownMs - EndTimesDurationMs)

    // Start the actual supernova after a delay
    setTimeout(startSupernovaExplosion, SupernovaCountdownMs);
    probeLaunchTime = +new Date();
}

function startSupernovaExplosion() {
    // Let the CSS know
    document.documentElement.classList.add("supernova-started");

    // Fade to black after animation is complete (3s)
    setTimeout(() => {
        document.documentElement.classList.add("supernova-completed")
    }, 3_000);
}

function setupMediaControls() {
    // Asynchronously get the SVGs and embed them (media control panel)
    document.querySelectorAll(".control-icon").forEach(icon_div => {
        const svgURL = `assets/icons/${icon_div.getAttribute("svg-name")}.svg`;
        embedSVG(svgURL, icon_div);
    })

    document.querySelector("#button--play-pause").onclick = () => {
        if(isPlaying) pauseAll();
        else playAll();
    };
    document.querySelector("#button--volume-0").onclick = () => setVolumeAll(0);
    document.querySelector("#button--volume-100").onclick = () => setVolumeAll(100);
    document.querySelector("#button--sync").onclick = sync;
}

function setDeviation() {
    const deviationAmountElement = document.querySelector(".deviation-text");

    let minTimestamp = 999;
    let maxTimestamp = 0;
    let allMuted = true;
    for(const audio of audios) {
        if(audio.volume === 0) continue;

        allMuted = false;
        minTimestamp = Math.min(minTimestamp, audio.currentTime);
        maxTimestamp = Math.max(maxTimestamp, audio.currentTime);
    }
    
    let deviationMs = 0;
    if(!allMuted) {
        deviationMs = (maxTimestamp - minTimestamp) * 1000;
    }

    const largeDeviationClass = "large-deviation";
    if(deviationMs >= 30) {
        deviationAmountElement.classList.add(largeDeviationClass);
    } else {
        deviationAmountElement.classList.remove(largeDeviationClass);
    }

    deviationAmountElement.innerHTML = `Travelers are out of sync by ${Math.round(deviationMs)} ms`;

    // While we're at it, log how much time is left till the supernova
    const timeSinceMs = (+new Date()) - probeLaunchTime;
    const minsSince = Math.floor(timeSinceMs / 1000 / 60);
    const secsSince = Math.floor((timeSinceMs / 1000) - minsSince * 60);
    console.info(`%c${minsSince} MINUTES, ${secsSince} SECONDS AGO: Long-range probe successfully launched from the %cOrbital Probe Cannon%c.`, "color: cyan;", "color: orange; font-weight: bold;", "");
}

function startDeviationChecker() {
    setInterval(setDeviation, 2000);
}

/**
 * Creates a card for each traveller
 * Calls setupTravellerAudios
 * Creates the media control panel
 */
function setupTravellerCards() {
    const container = document.querySelector(".traveller-grid");

    let containerInnerHTML = "";
    for(const info of travellers) {
        containerInnerHTML += getTravellerCardHTML(info);
    }

    container.innerHTML = containerInnerHTML;

    // Asynchronously get the SVGs and embed them (traveller icons)
    for(const info of travellers) {
        embedTravellerSVG(info);
    }
    
    // Setup card icons to mute/unmute when clicked
    for(let i = 0; i < travellers.length; ++i) {
        const info = travellers[i];
        const dataAttrSelector = `[data-traveller-name="${info["name"]}"]`;
        const icon = document.querySelector(`.traveller-card__icon${dataAttrSelector}`);
        icon.onclick = () => {
            const isMuted = audios[i].volume === 0;
            setVolume(info["name"], isMuted ? 100 : 0, true)
        }
    }

    setupTravellerAudios();
}

function getTravellerCardHTML(info) {
    const name = info["name"];
    
    return `
    <div class="traveller-card" data-traveller-name="${name}" style="--bloom-color: ${info["bloom-color"]}; --base-color: ${info["base-color"]};">
        <div class="traveller-card__inner">
            <div class="traveller-card__icon" data-traveller-name="${name}"></div>
            <div class="traveller-card__meta">
                <div class="traveller-card__name" data-traveller-name="${name}">${name}</div>
                <div class="traveller-card__audio">
                    <input type="range" data-traveller-name="${name}" class="volume-range-input" min="0" max="100" value="0">
                </div>
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

async function embedSVG(svgURL, element) {
    const svg = await fetch(svgURL).then(res => res.text());
    element.innerHTML = svg;
}

function setupTravellerAudios() {
    document.querySelectorAll(".volume-range-input").forEach(input => {
        // Yes, two listeners are necessary. This is to ensure at least one
        // is run after the first user interaction.
        input.onchange = event => {
            const travellerName = input.getAttribute("data-traveller-name");
            const percent = input.value;
            tryToSetVolume(travellerName, percent);
        }
        input.oninput = event => {
            const travellerName = input.getAttribute("data-traveller-name");
            const percent = input.value;
            tryToSetVolume(travellerName, percent);
        }
    })
}

function syncSpecificAudio(travellerIndex) {
    // Sync this with the one that's been interacted with
    for(let i = 0; i < travellers.length; ++i) {
        if(i == travellerIndex) continue;

        if(hasInteracted[i] === false) {
            // Sync up with this audio
            audios[travellerIndex].currentTime = audios[i].currentTime;
            break;
        }
    }
    hasInteracted[travellerIndex] = true;
}

function tryToSetVolume(travellerName, percent) {
    if(isFirstInteraction === true) {
        isFirstInteraction = false;
        return;
    }
    else if(isFirstInteraction === false) {
        isFirstInteraction = null;
        playAllAudios();
    }

    setVolume(travellerName, percent);
}

function setVolume(travellerName, percent, affectInput=false) {
    let travellerIndex = getTravellerIndex(travellerName);

    if(hasInteracted[travellerIndex] === false) {
        syncSpecificAudio(travellerIndex);
    }

    const audio = audios[travellerIndex];
    audio.volume = percent / 100;

    // Add effects to the traveller icon
    document.querySelector(`.traveller-card[data-traveller-name="${travellerName}"]`).style.setProperty("--fraction", percent / 100);

    if(affectInput === true) {
        const dataAttrSelector = `[data-traveller-name="${travellerName}"]`
        const volumeRangeInput = document.querySelector(`.volume-range-input${dataAttrSelector}`);
        volumeRangeInput.value = percent;
    }
}

setup();

function playAllAudios() {
    for(const audio of audios) {
        audio.play();
    }
}

function sync() {
    for(const audio of audios) {
        audio.currentTime = audios[0].currentTime;
    }
    setDeviation();
}

function setVolumeAll(percent) {
    // Set the visual inputs
    for(const info of travellers) {
        const dataAttrSelector = `[data-traveller-name="${info["name"]}"]`
        const volumeRangeInput = document.querySelector(`.volume-range-input${dataAttrSelector}`);
        volumeRangeInput.value = percent;
    }
    // Set the actual volumes
    for(const info of travellers) {
        setVolume(info["name"], percent)
    }
}

function pauseAll() {
    for(const audio of audios) {
        audio.pause();
    }
    isPlaying = false;
    const playPauseButton = document.querySelector("#button--play-pause");
    playPauseButton.classList.add("paused");
    playPauseButton.classList.remove("playing");
}

function playAll() {
    // This isn't as straightforward as the others.
    // There is no visual difference between playing and paused while a traveller is muted.
    // If *ALL* travellers are muted, then pressing play should set volumes to 100. Just for user convenience.

    let allMuted = true;
    for(const audio of audios) {
        if(audio.volume !== 0) {
            allMuted = false;
            break;
        }
    }

    for(const audio of audios) {
        audio.play();
    }

    if(allMuted) setVolumeAll(100);

    isPlaying = true;
    const playPauseButton = document.querySelector("#button--play-pause");
    playPauseButton.classList.add("playing");
    playPauseButton.classList.remove("paused");
}
