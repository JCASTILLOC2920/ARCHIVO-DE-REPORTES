#!/usr/bin/env python3
"""
Fast Router O(1) para el Protocolo Elena & La Colmena (Antigravity).
Permite resolución instantánea (<5ms) de skills, scripts, reglas y memoria
sin escaneo secuencial de directorios ni lecturas recursivas.
"""

import sys
import os
import json
import time
from pathlib import Path

ROUTER_PATH = Path(__file__).resolve().parent / "routing_index.json"
SCRATCH_ROUTER = Path(r"C:\Users\DELL\.gemini\antigravity\scratch\routing_index.json")

def load_routing_table():
    if ROUTER_PATH.exists():
        with open(ROUTER_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    if SCRATCH_ROUTER.exists():
        with open(SCRATCH_ROUTER, "r", encoding="utf-8") as f:
            return json.load(f)
    raise FileNotFoundError("routing_index.json no encontrado.")

def resolve_target(query_or_file: str):
    t0 = time.perf_counter()
    table_data = load_routing_table()
    kw_map = table_data.get("keyword_hash_map", {})
    file_map = table_data.get("file_target_hash_map", {})
    routes = table_data.get("routing_table", {})

    target_clean = os.path.basename(query_or_file).strip().lower()

    # 1. Match O(1) por nombre de archivo exacto
    if target_clean in file_map:
        route_id = file_map[target_clean]
        res = routes.get(route_id)
        elapsed = (time.perf_counter() - t0) * 1000
        return {"match_type": "file_hash", "route_id": route_id, "route": res, "latency_ms": round(elapsed, 3)}

    # 2. Match O(1) por token / palabra clave
    tokens = target_clean.replace(".", " ").replace("-", " ").replace("_", " ").split()
    for token in tokens:
        if token in kw_map:
            route_id = kw_map[token]
            res = routes.get(route_id)
            elapsed = (time.perf_counter() - t0) * 1000
            return {"match_type": "keyword_hash", "token": token, "route_id": route_id, "route": res, "latency_ms": round(elapsed, 3)}

    # Fallback instantáneo
    elapsed = (time.perf_counter() - t0) * 1000
    return {"match_type": "default", "route_id": "unified_memory_core", "route": routes.get("unified_memory_core"), "latency_ms": round(elapsed, 3)}

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "plantillas_data.js"
    result = resolve_target(query)
    print(json.dumps(result, indent=2, ensure_ascii=False))
