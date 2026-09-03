import json
import requests
import re

def test_groq_key(api_key):
    url = "https://api.groq.com/openai/v1/models"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    vault_path = r"E:\Archivos_IA\VAULT_LLAVES.json"
    output_path = r"d:\ARCHIVOS JOSEHP\paginas web\MACRORECORDER\llaves_activas_groq.json"
    
    with open(vault_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    # Extract all gsk_ keys
    keys = re.findall(r"gsk_[a-zA-Z0-9]+", content)
    unique_keys = list(set(keys))
    
    print(f"Found {len(unique_keys)} unique Groq keys. Testing them...")
    
    valid_keys = []
    
    for key in unique_keys:
        print(f"Testing {key[:10]}...")
        if test_groq_key(key):
            print(" -> Valid!")
            valid_keys.append(key)
            if len(valid_keys) == 4:
                break
        else:
            print(" -> Invalid (Removed from selection).")
            
    if valid_keys:
        with open(output_path, "w", encoding="utf-8") as out:
            json.dump({"groq_valid_keys": valid_keys}, out, indent=4)
        print(f"\nSuccessfully saved {len(valid_keys)} valid keys to {output_path}")
    else:
        print("\nNo valid keys found among the tested ones.")

if __name__ == "__main__":
    main()
