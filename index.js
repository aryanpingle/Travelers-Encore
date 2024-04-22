const travellerNames = ["Chert", "Esker", "Feldspar", "Gabbro", "Prisoner", "Riebeck", "Solanum"];
const travllerLocations = ["hourglass-twins", "timber-hearth", "dark-bramble", "giant-s-deep", "the-stranger", "brittle-hollow", "quantum-moon"];

let numAudiosReady = 0;

let isFirstPlay = true;
let allAudiosSetup = false;

const audios = travellerNames.map(name => {
    return new Audio(`./music/${name}.mp3`);
})

function setup() {
    audios.forEach(audio => {
        audio.loop = true;
        audio.volume = 0;
        
        audio.oncanplay = () => {
            if(allAudiosSetup) return;
    
            numAudiosReady++;
            if (numAudiosReady == travellerNames.length) {
                allAudiosSetup = true;
                allAudiosReady();
            }
        }
    })
}

setup();

// TODO: Switching tabs seemingly causes the browser to pause muted audios
// Switch to a play-only-on-press model
// Synchronize the played audio with an already playing audio
function allAudiosReady() {
    console.log("All audios are ready!");

    // Set onclick listeners
    document.querySelectorAll("#radial > g").forEach(group => {
        group.onclick = (event) => {
            if(isFirstPlay) {
                playAllAudios();
                isFirstPlay = false;
            }

            const locationName = group.id.substring("group_".length);
            const travellerIndex = travllerLocations.indexOf(locationName);

            const a = audios[travellerIndex];

            if(a.volume == 0) {
                // Playing it
                group.classList.add("playing");
            } else {
                // Pausing it
                group.classList.remove("playing");
            }
            a.volume = 1 - a.volume;
        }
    })
}

function playAllAudios() {
    for(const audio of audios) {
        audio.play();
    }
}
