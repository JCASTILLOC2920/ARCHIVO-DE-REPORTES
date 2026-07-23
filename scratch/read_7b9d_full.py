import os
import json

path = r"C:\Users\DELL\.gemini\antigravity\brain\7b9d7979-8247-47e3-bea6-2927c3697a61\.system_generated\logs\transcript.jsonl"
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for i, line in enumerate(f, 1):
            if i >= 104:
                try:
                    data = json.loads(line)
                    source = data.get("source")
                    type_ = data.get("type")
                    content = data.get("content", "")
                    if source == "USER_EXPLICIT" and type_ == "USER_INPUT":
                        print(f"--- STEP {i} USER ---")
                        print(content)
                    elif source == "MODEL" and type_ == "PLANNER_RESPONSE":
                        print(f"--- STEP {i} MODEL ---")
                        print(content[:600])
                        if len(content) > 600:
                            print("... [TRUNCATED]")
                except Exception as e:
                    pass
