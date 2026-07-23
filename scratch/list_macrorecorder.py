import os

path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder"

print("--- LIST OF MACRORECORDER DIRECTORY ---")
if os.path.exists(path):
    for f in os.listdir(path):
        full_p = os.path.join(path, f)
        is_dir = os.path.isdir(full_p)
        print(f"{'[DIR] ' if is_dir else '[FILE]'} {f}")
else:
    print("macrorecorder directory does not exist.")
