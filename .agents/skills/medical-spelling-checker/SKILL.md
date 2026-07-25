---
name: medical-spelling-checker
description: Checks spelling, accentuation (tildes), and capitalization of medical terms in templates.
---

# Medical Spelling Checker Skill

Use this skill to audit all text descriptions inside the templates to ensure strict adherence to quality and spelling standards.

## Policies Enforced
1. **Proper Nouns Capitalization**: Names like Bethesda, Lester, Papanicolaou, and acronyms like RTU, HP, NIC, BAAR must retain correct capitalization.
2. **Clinical Terms Lowercase**: Descriptions must be lowercase except for the start of sentences or proper nouns.
3. **No Strange Characters**: Ensure no weird characters from web copy-pasting exist in the texts.

## Instructions
1. Run the Python validation script to parse the templates and report anomalies:
   ```bash
   python .agents/skills/medical-spelling-checker/scripts/check_spelling.py <path_to_plantillas_data_js>
   ```
2. Interpret output:
   - Exit code 0: All templates are spellchecked and look perfect.
   - Exit code 1: Follow the script suggestions and fix typos or casing issues.
