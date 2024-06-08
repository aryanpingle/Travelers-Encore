import { embedSVG } from "./util";

const EndTimesAudio = new Audio("./music/End Times (Trimmed).mp3");

export function setupSupernova() {
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
}

function startSupernovaExplosion() {
    // Let the CSS know
    document.documentElement.classList.add("supernova-started");

    // Fade to black after animation is complete (3s)
    setTimeout(() => {
        document.documentElement.classList.add("supernova-completed")
    }, 3_000);
}