---
name: layout-math-validator
description: Audits HTML and CSS layout spacing rules to prevent page pagination regressions.
---

# Layout Math Validator Skill

Use this skill to audit `imprimir.html` to guarantee that A4 dimension constraints, flex alignment, and dynamic page calculations remain intact.

## Rules Audited
1. **A4 Dimension Compliance**: `.pv-sheet` height must match standard A4 page limits (297mm / ~1123px).
2. **Measurement BFC Isolation**: The page measurement container (`measurePage`) must have `display: flow-root` to avoid collapsing margins.
3. **Signature Alignment**: The signature block must use flex alignment (`margin-top: auto` on a flex column parent) to align neatly at the page bottom.

## Instructions
1. Run the Python layout auditor:
   ```bash
   python .agents/skills/layout-math-validator/scripts/check_layout.py <path_to_imprimir_html>
   ```
2. Interpret output:
   - Exit code 0: Layout matches A4-mathematical standards perfectly.
   - Exit code 1: Fix the spacing or sizing discrepancies reported by the script.
