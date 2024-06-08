export async function embedSVG(svgURL, element) {
    const svg = await fetch(svgURL).then(res => res.text());
    element.innerHTML = svg;
}