import os
import json

brain_dir = r"C:\Users\DELL\.gemini\antigravity\brain"
matches = []

# List all subfolders in brain_dir which are conversation IDs
convos = [d for d in os.listdir(brain_dir) if len(d) == 36 and d.count("-") == 4]

for convo_id in convos:
    path = os.path.join(brain_dir, convo_id, ".system_generated", "logs", "transcript.jsonl")
    if os.path.exists(path):
        excel_found = False
        corrupt_found = False
        pdf_found = False
        matching_lines = []
        try:
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                for line_num, line in enumerate(f, 1):
                    lower_line = line.lower()
                    if "excel" in lower_line:
                        excel_found = True
                    if "corrup" in lower_line:
                        corrupt_found = True
                    if "pdf" in lower_line:
                        pdf_found = True
                    if "excel" in lower_line or "corrupt" in lower_line or "recuperar" in lower_line:
                        try:
                            data = json.loads(line)
                            content = data.get("content", "")
                            if not content and "tool_calls" in data:
                                content = str(data["tool_calls"])
                            if "excel" in content.lower() or "corrup" in content.lower() or "recuperar" in content.lower():
                                matching_lines.append(f"Line {line_num}: {content[:200]}")
                        except Exception:
                            pass
            if excel_found or corrupt_found:
                matches.append({
                    "convo_id": convo_id,
                    "excel": excel_found,
                    "corrupt": corrupt_found,
                    "pdf": pdf_found,
                    "lines": matching_lines[:5]
                })
        except Exception as e:
            pass

print(json.dumps(matches, indent=2))
