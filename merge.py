from os import system

system(".\\node_modules\\.bin\\esbuild perry.js --minify --outfile=perryperry.js")
system(".\\node_modules\\.bin\\esbuild perry.css --minify --outfile=perryperry.css")

with open("perry.html") as file:
    html = file.readlines()

with open("perryperry.js") as file:
    js = file.readlines()

with open("perryperry.css") as file:
    css = file.readlines()

merged = ""

html_idx = 0

while html_idx < len(html):
    if html[html_idx].strip() == "<script src=\"perry.js\"></script>":
        merged += "<script>"
        for line in js:
            add = line.strip("\n ")
            if add and add[len(add) - 1] in "}`":
                add += ";"
            merged += add
        merged += "</script>"
    elif html[html_idx].strip() == "<link rel=\"stylesheet\" href=\"perry.css\">":
        merged += "<style>"
        for line in css:
            merged += line.strip("\n ")
        merged += "</style>"
    else:
        merged += html[html_idx].strip("\n ")
    html_idx += 1

with open("perryperry.html", "w") as file:
    file.write(merged)
