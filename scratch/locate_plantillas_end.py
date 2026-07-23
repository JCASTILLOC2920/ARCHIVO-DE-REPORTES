path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\plantillas_data.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# Let's search for "PÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA" to locate the end
last_idx = content.find("PÓLIPO ENDOCERVICAL CON INFLAMACIÓN AGUDA")
bracket_idx = content.find("];", last_idx)

if last_idx != -1 and bracket_idx != -1:
    print("Found target template Ginecologia. End bracket at:", bracket_idx)
    print("Context:")
    print(content[last_idx:bracket_idx+10])
else:
    print("Not found!")
