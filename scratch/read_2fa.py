import os
import json

path = r"C:\Users\DELL\.gemini\antigravity\brain\2fa082b8-a776-4b04-b92b-1db8129267ef\.system_generated\logs\transcript.jsonl"
if os.path.exists(path):
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            try:
                data = json.loads(line)
                source = data.get("source")
                type_ = data.get("type")
                content = data.get("content", "")
                if source == "USER_EXPLICIT" and type_ == "USER_INPUT":
                    print(f"USER: {content}")
                elif source == "MODEL" and type_ == "PLANNER_RESPONSE":
                    print(f"MODEL: {content[:300]}...")
            except Exception as e:
                pass
else:
    print("Not found")
