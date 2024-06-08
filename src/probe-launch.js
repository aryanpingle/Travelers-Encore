let probeLaunchTime = +(new Date());

export function updateProbeLaunchTime() {
    const timeSinceMs = (+new Date()) - probeLaunchTime;
    const minsSince = Math.floor(timeSinceMs / 1000 / 60);
    const secsSince = Math.floor((timeSinceMs / 1000) - minsSince * 60);
    console.info(`%c${minsSince} MINUTES, ${secsSince} SECONDS AGO: Long-range probe successfully launched from the %cOrbital Probe Cannon%c.`, "color: cyan;", "color: orange; font-weight: bold;", "");
}
