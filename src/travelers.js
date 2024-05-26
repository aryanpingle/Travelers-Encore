export const travellers = [
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

export function getTravellerIndex(name) {
    for(let i = 0; i < travellers.length; ++i) {
        if(travellers[i]["name"].toLowerCase() == name.toLowerCase()) {
            return i;
        }
    }
    return -1;
}