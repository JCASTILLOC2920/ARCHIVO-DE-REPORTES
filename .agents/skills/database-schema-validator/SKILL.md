---
name: database-schema-validator
description: Validates SQL schema files for compliance with internal safety and naming policies.
---

# Database Schema Validator Skill

Use this skill to validate that any SQL database schema file complies with policies.

## Instructions
1. Run the Python validation script on the target SQL file:
   ```bash
   python .agents/skills/database-schema-validator/scripts/validate_schema.py <path_to_sql_file>
   ```
2. Interpret output:
   - Exit code 0: The schema is fully compliant.
   - Exit code 1: Check the printed errors and fix them.
