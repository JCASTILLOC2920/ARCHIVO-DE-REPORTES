line = "const response = await fetch('https://api.languagetoolplus.com/v2/check', {\n"
print("opens:", line.count('{'))
print("closes:", line.count('}'))
