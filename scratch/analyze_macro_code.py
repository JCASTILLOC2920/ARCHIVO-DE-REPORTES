import ast
import os

files_to_analyze = [
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\main.py",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\nucleo_voz.py",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\gui_cortana.py",
    r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\macrorecorder\micro_symspell.py"
]

for filepath in files_to_analyze:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    
    print(f"\n=================== ANALYZING: {os.path.basename(filepath)} ===================")
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
    
    try:
        tree = ast.parse(content)
        # Find all functions, classes, and top-level variables
        for node in ast.iter_child_nodes(tree):
            if isinstance(node, ast.FunctionDef):
                print(f"Function: def {node.name}(...) - Line {node.lineno}")
            elif isinstance(node, ast.ClassDef):
                print(f"Class: class {node.name} - Line {node.lineno}")
                for subnode in ast.iter_child_nodes(node):
                    if isinstance(subnode, ast.FunctionDef):
                        print(f"  Method: def {subnode.name}(...) - Line {subnode.lineno}")
    except Exception as e:
        print(f"Error parsing AST: {e}")
