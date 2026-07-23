import os
import json

path = r"C:\Users\DELL\.gemini\antigravity\brain\f1b8652b-691c-47c8-9614-9f8440511d47\.system_generated\logs\transcript.jsonl"

print("--- SUBAGENT TRANSCRIPT LOG ---")
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        lines = f.readlines()
    for idx, line in enumerate(lines[-15:], 1):
        try:
            data = json.loads(line)
            print(f"Step {data.get('step_index')}: Source={data.get('source')}, Type={data.get('type')}, Status={data.get('status')}")
            content = data.get('content') or ""
            if content:
                print(f"  Content: {content[:300]}")
            if data.get('tool_calls'):
                print(f"  Tool calls: {data.get('tool_calls')}")
        except Exception as e:
            print("Line parsing error:", e)
else:
    print("Subagent log file does not exist yet.")
