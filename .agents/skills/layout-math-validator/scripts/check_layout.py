import sys
import re

def check_layout(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
            
        errors = []
        
        # 1. Check A4 dimensions in CSS
        a4_height_pattern = r'\.pv-sheet\s*\{[^}]*height\s*:\s*(?:297mm|297\s*mm)[^}]*\}'
        if not re.search(a4_height_pattern, content, re.IGNORECASE):
            # Check min-height as fallback
            a4_min_height_pattern = r'\.pv-sheet\s*\{[^}]*min-height\s*:\s*(?:297mm|297\s*mm)[^}]*\}'
            if not re.search(a4_min_height_pattern, content, re.IGNORECASE):
                errors.append("ERROR: .pv-sheet height must be set to 297mm for strict A4 compliance.")
            
        # 2. Check BFC container configuration for measurePage
        measure_bfc_pattern = r'#measurePage\s*\{[^}]*display\s*:\s*flow-root[^}]*\}'
        if not re.search(measure_bfc_pattern, content, re.IGNORECASE):
            errors.append("ERROR: #measurePage must have 'display: flow-root' to prevent margin collapsing in height calculations.")
            
        # 3. Check Signature Alignment CSS properties
        signature_align_pattern = r'\.footer-signature\s*\{[^}]*margin-top\s*:\s*auto[^}]*\}'
        if not re.search(signature_align_pattern, content, re.IGNORECASE):
            errors.append("ERROR: .footer-signature must have 'margin-top: auto' to align correctly at the bottom of the page.")

        if errors:
            for err in errors:
                print(err)
            sys.exit(1)
        else:
            print("Layout mathematical constraints validation passed.")
            sys.exit(0)
            
    except FileNotFoundError:
        print(f"Error: File '{filename}' not found.")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_layout.py <layout_file>")
        sys.exit(1)
        
    check_layout(sys.argv[1])
