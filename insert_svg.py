import re
import textwrap

START_COMMENT = "<!-- SVG START -->"
END_COMMENT = "<!-- SVG END -->"

with open("assets/generated/radial.svg") as f:
    svg = f.read()

with open("index.html") as f:
    html = f.read()

html = re.sub(rf"(?<={START_COMMENT}).*?(?={END_COMMENT})", "\n" + svg + "\n", html, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(html)
