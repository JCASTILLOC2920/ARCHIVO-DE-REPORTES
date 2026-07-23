import os
import json

conv_dir = r"C:\Users\DELL\.gemini\antigravity\conversations"
matches = []

for file in os.listdir(conv_dir):
    if file.endswith(".pb"):
        path = os.path.join(conv_dir, file)
        try:
            with open(path, "rb") as f:
                content = f.read()
                # Search for keywords in raw bytes
                has_excel = b"excel" in content.lower()
                has_corrupt = b"corrup" in content.lower()
                has_pdf = b"pdf" in content.lower()
                if has_excel or has_corrupt:
                    matches.append({
                        "file": file,
                        "excel": has_excel,
                        "corrupt": has_corrupt,
                        "pdf": has_pdf,
                        "size": len(content)
                    })
        except Exception as e:
            print(f"Error reading {file}: {e}")

print(json.dumps(matches, indent=2))
