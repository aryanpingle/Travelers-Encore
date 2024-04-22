import re

import xml.dom.minidom as minidom


PLANET_ICONS_DIR = "./assets/planet-icons"
SVG_ID = "radial-svg"

with open("assets/figma/radial.svg") as f:
    svg = f.read()

svg_parser = minidom.parseString(svg)

def removeNode(node: minidom.Element):
    node.parentNode.removeChild(node)

# Remove all <image></image>
for image_node in svg_parser.getElementsByTagName("image"):
    removeNode(image_node)

def convert_rect_to_image(rect: minidom.Element) -> minidom.Element:
    if not rect.hasAttribute("id"):
        return

    rect.removeAttribute("fill")
    
    rect_id = rect.getAttribute("id")
    image_name = rect_id[len("icon_"):]
    
    image = svg_parser.createElement("image")
    image.setAttribute("href", f"{PLANET_ICONS_DIR}/{image_name}.png")
    for attr, val in rect.attributes.items():
        image.setAttribute(attr, val)
    
    rect.parentNode.appendChild(image)
    removeNode(rect)

rects = svg_parser.getElementsByTagName("rect")
for rect in rects:
    convert_rect_to_image(rect)

for path in svg_parser.getElementsByTagName("path"):
    path.setAttribute("fill", "transparent")
    pass

svg_element = svg_parser.getElementsByTagName("svg")[0]
svg_element.setAttribute("id", SVG_ID)

svg_code = svg_parser.toprettyxml()
svg_code = re.sub(r"\n\s*\n", "\n", svg_code, flags=re.DOTALL)
with open("assets/generated/radial.svg", "w") as f:
    f.write(svg_code)

# svg = re.sub(r"<image.*?>\n*", "", svg, re.DOTALL)

# def get_image_from_rect(match: re.Match[str]) -> str:
#     rect = match.group()
#     id = re.search(r"(?<=id=\").*?(?=\")", rect).group()
#     image_name = id[len("icon_"):]
#     attributes = re.search(r"<rect(.*?)/>", rect, re.DOTALL).group(1).strip()
#     attributes = re.sub(r"fill=\".*?\"", "", attributes, re.DOTALL)
#     return f'<image href="{PLANET_ICONS_DIR}/{image_name}.png" {attributes}></image>'

# # Replace <rect /> with its corresponding <image></image>
# svg = re.sub(r"<rect id=.*?/>", get_image_from_rect, svg, re.DOTALL)

# # Add id to svg
# svg = re.sub("<svg", f"<svg id=\"{SVG_ID}\"", svg, count=1)

# with open("assets/ui/radial.svg", "w") as f:
#     f.write(svg)
