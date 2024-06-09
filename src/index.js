import { travellers, getTravellerIndex } from "./travelers";
import { updateProbeLaunchTime } from "./probe-launch";
import { setupSupernova } from "./supernova";
import { embedSVG } from "./util";

let isPlaying = false;

// TODO: Check if this is actually useful
// Checks if the given audio has been interacted at least once before
// Useful for syncing this audio with the first one that is playing
const hasInteracted = new Array(travellers.length).fill(false);

// Create audios and set their properties
const audios = travellers.map(info => {
    return new Audio(`./music/${info["name"]}.mp3`);
});

// AudioContext is needed for iOS devices
const AudioContext = window.AudioContext //|| window.WebkitAudioContext;
const audioCtx = new AudioContext();
const tracks = audios.map(audio => audioCtx.createMediaElementSource(audio));
const gainNodes = audios.map(() => audioCtx.createGain());
// Connect everything
audios.forEach((audio, audioIdx) => {
    tracks[audioIdx].connect(gainNodes[audioIdx]);

    gainNodes[audioIdx].connect(audioCtx.destination);
    gainNodes[audioIdx].gain.value = 0;

    audio.loop = true;
})

function setup() {
    setupTravellerCards();
    setupMediaControls();
    startDeviationChecker();
    setupSupernova();
    setupKeyboardListener();
    setupMediaSession();
}

function tryInitAudioContext() {
    if(audioCtx.state === "suspended")
        audioCtx.resume();
}

/**
 * Use the `mediaSession` API to create a rich "Now Playing" widget.
 */
function setupMediaSession() {
    if(!("mediaSession" in navigator)) return;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: "Your Traveler's Encore",
        artist: "Aryan Pingle",
        album: "The Outer Wilds - Echoes of The Eye",
        artwork: [
            { src: './assets/images/wallpaper.jpg',   sizes: '1000x562',   type: 'image/jpg' },
        ]
    });

    const actionHandlers = [
        ['play', playAll],
        ['pause', pauseAll],
        ['previoustrack', () => {
            for(const audio of audios) {
                audio.currentTime = 0;
            }
        }],
        ['nexttrack', () => {
            for(const audio of audios) {
                audio.currentTime = 0;
            }
        }],
        ['stop', () => {
            pauseAll();
            for(const audio of audios) {
                audio.currentTime = 0;
            }
        }],
    ];

    for (const [action, handler] of actionHandlers) {
        try {
            navigator.mediaSession.setActionHandler(action, handler);
        } catch (error) {
            console.log(`The media session action "${action}" is not supported yet.`);
        }
    }
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

function setupMediaControls() {
    // Asynchronously get the SVGs and embed them (media control panel)
    // document.querySelectorAll(".control-icon").forEach(icon_div => {
    //     const svgURL = `assets/icons/${icon_div.getAttribute("svg-name")}.svg`;
    //     embedSVG(svgURL, icon_div);
    // })

    document.querySelector("#button--play-pause").onclick = () => {
        if(isPlaying) pauseAll();
        else playAll();
    };
    document.querySelector("#button--volume-0").onclick = () => setVolumeAll(0);
    document.querySelector("#button--volume-100").onclick = () => setVolumeAll(100);
    document.querySelector("#button--sync").onclick = sync;
    document.querySelector(".playback-speed-input").oninput = function() {
        setGlobalPlaybackSpeed(parseFloat(this.value));
    }
}

function setGlobalPlaybackSpeed(speed) {
    for(const audio of audios) {
        audio.playbackRate = speed;
    }
    // Update UI
    document.querySelector(".playback-speed").innerHTML = speed.toFixed(2) + "x";
}

///////////////////////////////////
//   Check for audio deviation   //
///////////////////////////////////

function startDeviationChecker() {
    setInterval(setDeviation, 2000);
}

function setDeviation() {
    const deviationAmountElement = document.querySelector(".deviation-text");

    // Calculate the minimum and maximum timestamps
    let minTimestamp = 999;
    let maxTimestamp = 0;
    let allMuted = true;
    audios.forEach((audio, audioIdx) => {
        if(isAudioMuted(audioIdx)) return;

        allMuted = false;
        minTimestamp = Math.min(minTimestamp, audio.currentTime);
        maxTimestamp = Math.max(maxTimestamp, audio.currentTime);
    });
    
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

    updateProbeLaunchTime()
}

function isAudioMuted(audioIndex) {
    return gainNodes[audioIndex].gain.value === 0;
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
            setVolumeAndAffectInput(info["name"], isAudioMuted(i) ? 100 : 0);
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
    `.trim();
}

async function embedTravellerSVG(info) {
    const svgURL = `assets/planet-svgs/${info["location-slug"]}.svg`;
    const name = info["name"];
    const travelerElement = document.querySelector(`.traveller-card__icon[data-traveller-name="${name}"]`);
    embedSVG(svgURL, travelerElement);
}

function setupTravellerAudios() {
    document.querySelectorAll(".volume-range-input").forEach(input => {
        // Yes, two listeners are necessary. This is to ensure at least one
        // is run after the first user interaction.
        input.oninput = event => {
            tryInitAudioContext();
            const travellerName = input.getAttribute("data-traveller-name");
            const percent = input.value;
            setVolume(travellerName, percent);
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

function setVolumeAndAffectInput(travellerName, percent) {
    setVolume(travellerName, percent);

    const dataAttrSelector = `[data-traveller-name="${travellerName}"]`;
    const volumeRangeInput = document.querySelector(`.volume-range-input${dataAttrSelector}`);
    volumeRangeInput.value = percent;
}

function setVolume(travellerName, percent) {
    tryInitAudioContext();

    let travellerIndex = getTravellerIndex(travellerName);

    if(hasInteracted[travellerIndex] === false) {
        syncSpecificAudio(travellerIndex);
    }

    // const audio = audios[travellerIndex];
    // audio.volume = percent / 100;
    gainNodes[travellerIndex].gain.value = percent / 100;

    // Add effects to the traveller icon
    document.querySelector(`.traveller-card[data-traveller-name="${travellerName}"]`).style.setProperty("--fraction", percent / 100);
}

setup();

function sync() {
    for(const audio of audios) {
        audio.currentTime = audios[0].currentTime;
    }
    setDeviation();
}

function setVolumeAll(percent) {
    tryInitAudioContext();

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
    tryInitAudioContext();

    for(const audio of audios) {
        audio.pause();
    }
    isPlaying = false;
    const playPauseButton = document.querySelector("#button--play-pause");
    playPauseButton.classList.add("paused");
    playPauseButton.classList.remove("playing");
}

function playAll() {
    tryInitAudioContext();

    // This isn't as straightforward as the others.
    // There is no visual difference between playing and paused while a traveller is muted.
    // If *ALL* travellers are muted, then pressing play should set volumes to 100. Just for user convenience.

    let allMuted = true;
    for(let i = 0; i < audios.length; ++i) {
        if(!isAudioMuted(i)) {
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
