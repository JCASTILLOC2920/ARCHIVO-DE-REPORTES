import os
import json

path = r"C:\Users\DELL\.gemini\antigravity\brain\7b9d7979-8247-47e3-bea6-2927c3697a61\.system_generated\logs\transcript.jsonl"
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line_num, line in enumerate(f, 1):
            if "excel" in line.lower() or "corrup" in line.lower() or "pdf" in line.lower():
                try:
                    data = json.loads(line)
                    print(f"Line {line_num}: {data.get('source')} - {data.get('type')}")
                    content = data.get("content", "")
                    if not content and "tool_calls" in data:
                        content = str(data["tool_calls"])
                    print(f"  {content[:200]}...")
                except:
                    pass
