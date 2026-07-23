path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\imprimir.html"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

# 1. Move page-footer outside table to be direct child of #pvSheet
old_table_footer = """<div class="page-footer">
<div class="page-footer-left" id="lblFooterText"></div>
<div class="page-footer-right" id="lblPageNum"><span>página 1 de 1</span></div>
</div>
</td>
</tr>
</tbody>
<tfoot>
<tr>
<td style="padding: 0;">
<div class="footer-space" style="height: 0;"></div>
</td>
</tr>
</tfoot>
</table>"""

# Let's try matching with flexible whitespace
pattern_footer = r'<div class="page-footer">\s*<div class="page-footer-left" id="lblFooterText"></div>\s*<div class="page-footer-right" id="lblPageNum"><span>p[^<]*gyna? 1 de 1</span></div>\s*</div>\s*</td>\s*</tr>\s*</tbody>\s*<tfoot>\s*<tr>\s*<td style="padding: 0;">\s*<div class="footer-space" style="height: 0;"></div>\s*</td>\s*</tr>\s*</tfoot>\s*</table>'

new_table_footer = """</td>
</tr>
</tbody>
<tfoot>
<tr>
<td style="padding: 0;">
<div class="footer-space" style="height: 0;"></div>
</td>
</tr>
</tfoot>
</table>
<div class="page-footer">
    <div class="page-footer-left" id="lblFooterText"></div>
    <div class="page-footer-right" id="lblPageNum"><span>página 1 de 1</span></div>
</div>"""

import re

if re.search(pattern_footer, content):
    content = re.sub(pattern_footer, new_table_footer, content, count=1)
    print("Footer repositioned successfully!")
else:
    print("Footer pattern NOT matched! Will attempt exact line replacement.")
    # Fallback line replacement
    lines = content.splitlines()
    # Find <div class="page-footer"> around line 604
    footer_idx = -1
    for idx, l in enumerate(lines):
        if '<div class="page-footer">' in l and idx > 500:
            footer_idx = idx
            break
            
    if footer_idx != -1:
        # Extract the 4 lines of page-footer
        footer_block = lines[footer_idx:footer_idx+4]
        del lines[footer_idx:footer_idx+4]
        # Find </table> after footer_idx
        for idx in range(footer_idx, len(lines)):
            if '</table>' in lines[idx]:
                lines.insert(idx+1, "\n".join(footer_block))
                print("Footer block moved after </table>!")
                break
        content = "\n".join(lines)

# 2. Remove duplicate #print-footer at bottom of document
pattern_print_footer = r'<div id="print-footer">\s*<div style="display: flex; align-items: center;">\s*<span style="display:inline-block; width:12px; height:12px; background-color:#3b74b3; border-radius:50%; margin-right:8px; margin-left:15px;"></span>\s*<span id="lblFooterText" style="color: #000;"></span>\s*</div>\s*</div>'

content = re.sub(pattern_print_footer, "", content)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("imprimir.html FOOTER FIX COMPLETED SUCCESSFULLY!")
