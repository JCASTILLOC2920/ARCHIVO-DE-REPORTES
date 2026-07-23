import os
import json

json_path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\datos_extraidos_2026.json"
img_dir = r"C:\Users\DELL\Desktop\QUIRURGICOS 2026\imagenes_extraidas"

with open(json_path, "r", encoding="utf-8") as f:
    pdf_data = json.load(f)

patients_with_imgs = []
for p in pdf_data:
    imgs = p.get("imagenes", [])
    if imgs:
        existing_imgs = [img for img in imgs if os.path.exists(os.path.join(img_dir, img))]
        if existing_imgs:
            patients_with_imgs.append({
                "codigo": p.get("codigo"),
                "nombre": p.get("nombre"),
                "imagenes": existing_imgs
            })

print(f"Total patients in 2026 JSON with extracted physical image files: {len(patients_with_imgs)}")
for p in patients_with_imgs[:40]:
    print(f"  {p['codigo']}: {p['nombre']} -> {p['imagenes']}")
