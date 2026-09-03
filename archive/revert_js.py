import os

path = r"c:\Users\HP\Desktop\repositorio\ARCHIVO DE REPORTES\reportes.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

cut_idx = len(lines)
for i in range(len(lines)):
    if "PROTOCOLO ACTOR-CRITICO: CASCADA" in lines[i]:
        cut_idx = i - 1
        break

lines = lines[:cut_idx]

with open(path, "w", encoding="utf-8") as f:
    f.writelines(lines)
