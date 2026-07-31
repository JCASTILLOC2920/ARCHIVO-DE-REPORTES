import re
import os

html_path = "reportes.html"

with open(html_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove font-awesome cdns
content = re.sub(r'<!-- FontAwesome para iconos -->\n\s*<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">\n', '', content)
content = re.sub(r'\s*<link rel="preload" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" as="style">\n', '\n', content)
content = re.sub(r'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/[^"]+">', '', content)

# 2. Icon Mapping (Lucide style)
def get_svg(name, extra_class=""):
    cls = f"lucide lucide-{name} {extra_class}".strip()
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="{cls}"><use href="#{name}"/></svg>'

icon_map = {
    'fa-microscope': 'microscope',
    'fa-user-shield': 'shield-check',
    'fa-chevron-down': 'chevron-down',
    'fa-square-check': 'check-square',
    'fa-bars': 'menu',
    'fa-circle-check': 'check-circle',
    'fa-database': 'database',
    'fa-download': 'download',
    'fa-pencil': 'pencil',
    'fa-lock': 'lock',
    'fa-copy': 'copy',
    'fa-pen': 'pen-tool',
    'fa-brain': 'brain',
    'fa-paste': 'clipboard-paste',
    'fa-check': 'check',
    'fa-plus': 'plus',
    'fa-cloud-arrow-down': 'cloud-download',
    'fa-trash-can': 'trash-2',
    'fa-xmark': 'x',
    'fa-microphone': 'mic',
    'fa-bold': 'bold',
    'fa-italic': 'italic',
    'fa-underline': 'underline',
    'fa-align-left': 'align-left',
    'fa-align-center': 'align-center',
    'fa-align-right': 'align-right',
    'fa-align-justify': 'align-justify',
    'fa-list-ul': 'list',
    'fa-list-ol': 'list-ordered',
    'fa-file-import': 'file-input',
    'fa-folder-plus': 'folder-plus',
    'fa-trash': 'trash',
    'fa-print': 'printer',
    'fa-magnifying-glass': 'search',
    'fa-pen-to-square': 'edit',
}

def replace_icon(match):
    full_class = match.group(1)
    # find the fa- token
    tokens = full_class.split()
    fa_token = next((t for t in tokens if t.startswith('fa-') and t not in ['fa-solid', 'fa-regular']), None)
    if fa_token and fa_token in icon_map:
        lucide_name = icon_map[fa_token]
        return get_svg(lucide_name, "icon-svg")
    elif fa_token:
        # Fallback
        name = fa_token.replace('fa-', '')
        return get_svg(name, "icon-svg")
    return match.group(0)

content = re.sub(r'<i class="([^"]*)"></i>', replace_icon, content)

# Inject SVG defs for lucide icons at the top of body
svg_defs = """
<svg style="display: none;" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <g id="microscope"><path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/></g>
    <g id="shield-check"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 7-2 2.5 0 4.5 1 7 2a1 1 0 0 1 1 1v7z"/><path d="m9 12 2 2 4-4"/></g>
    <g id="chevron-down"><path d="m6 9 6 6 6-6"/></g>
    <g id="check-square"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></g>
    <g id="menu"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></g>
    <g id="check-circle"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></g>
    <g id="database"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></g>
    <g id="download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></g>
    <g id="pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></g>
    <g id="lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></g>
    <g id="copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></g>
    <g id="pen-tool"><path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/></g>
    <g id="brain"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"/><path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"/><path d="M17.599 6.5a3 3 0 0 0 .399-1.375"/></g>
    <g id="clipboard-paste"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></g>
    <g id="check"><path d="M20 6 9 17l-5-5"/></g>
    <g id="plus"><path d="M5 12h14"/><path d="M12 5v14"/></g>
    <g id="cloud-download"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></g>
    <g id="trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></g>
    <g id="x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></g>
    <g id="mic"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></g>
    <g id="bold"><path d="M14 12a4 4 0 0 0 0-8H6v8"/><path d="M15 20a4 4 0 0 0 0-8H6v8Z"/></g>
    <g id="italic"><line x1="19" x2="10" y1="4" y2="4"/><line x1="14" x2="5" y1="20" y2="20"/><line x1="15" x2="9" y1="4" y2="20"/></g>
    <g id="underline"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" x2="20" y1="20" y2="20"/></g>
    <g id="align-left"><line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/></g>
    <g id="align-center"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></g>
    <g id="align-right"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></g>
    <g id="align-justify"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></g>
    <g id="list"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></g>
    <g id="list-ordered"><line x1="10" x2="21" y1="6" y2="6"/><line x1="10" x2="21" y1="12" y2="12"/><line x1="10" x2="21" y1="18" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></g>
    <g id="file-input"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M2 15h10"/><path d="m9 18 3-3-3-3"/></g>
    <g id="folder-plus"><path d="M12 10v6"/><path d="M9 13h6"/><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></g>
    <g id="trash"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></g>
    <g id="printer"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></g>
    <g id="search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></g>
    <g id="edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></g>
  </defs>
</svg>
"""

content = content.replace('<body>', f'<body>\n{svg_defs}')

# 3. Add Premium Clinical Theme CSS
premium_css = """
    <style id="premium-clinical-theme">
        :root {
            --primary-hsl: 214, 100%, 45%;      /* #0066ff */
            --primary-light-hsl: 214, 100%, 95%; 
            --secondary-hsl: 200, 10%, 20%;     
            --bg-body-hsl: 210, 20%, 98%;       
            --surface-hsl: 0, 0%, 100%;         
            --border-hsl: 214, 20%, 90%;        
            --text-main-hsl: 215, 25%, 27%;     
            --text-muted-hsl: 215, 15%, 50%;    
            --success-hsl: 142, 71%, 45%;       
            --danger-hsl: 348, 83%, 47%;        
            --warning-hsl: 38, 92%, 50%;        
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            --radius-md: 8px;
            --radius-lg: 12px;
            --transition: all 0.2s ease-in-out;
        }

        body {
            background-color: hsl(var(--bg-body-hsl));
            color: hsl(var(--text-main-hsl));
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
        }

        /* SVG Icons */
        .icon-svg {
            display: inline-block;
            vertical-align: middle;
            width: 1em;
            height: 1em;
            margin-right: 0.25rem;
        }
        button .icon-svg, a .icon-svg { margin-right: 6px; }
        .action-header .icon-svg { margin-right: 0; }
        .sidebar .icon-svg { font-size: 1.25rem; margin-right: 12px; }

        /* Tables Premium Design */
        .table-container {
            background: hsl(var(--surface-hsl));
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-sm);
            border: 1px solid hsl(var(--border-hsl));
            overflow: hidden;
            margin-bottom: 1.5rem;
        }
        
        .report-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
        }

        .report-table th {
            background-color: hsl(var(--bg-body-hsl));
            color: hsl(var(--text-muted-hsl));
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            padding: 12px 16px;
            border-bottom: 1px solid hsl(var(--border-hsl));
            white-space: nowrap;
        }

        .report-table td {
            padding: 12px 16px;
            border-bottom: 1px solid hsl(var(--border-hsl));
            color: hsl(var(--text-main-hsl));
            font-size: 0.875rem;
            vertical-align: middle;
            transition: var(--transition);
        }

        .report-table tbody tr:hover td {
            background-color: hsl(var(--primary-light-hsl));
        }

        .report-table tbody tr:last-child td {
            border-bottom: none;
        }

        /* Buttons Premium Design */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            font-weight: 500;
            font-size: 0.875rem;
            border-radius: var(--radius-md);
            border: 1px solid transparent;
            cursor: pointer;
            transition: var(--transition);
            line-height: 1.25rem;
        }

        .btn-primary {
            background-color: hsl(var(--primary-hsl));
            color: white;
            box-shadow: var(--shadow-sm);
        }

        .btn-primary:hover {
            background-color: hsl(var(--primary-hsl), 0.9);
            transform: translateY(-1px);
            box-shadow: var(--shadow-md);
        }

        .btn-secondary, .btn-secondary-blue {
            background-color: white;
            color: hsl(var(--primary-hsl));
            border-color: hsl(var(--border-hsl));
        }

        .btn-secondary:hover, .btn-secondary-blue:hover {
            background-color: hsl(var(--primary-light-hsl));
            border-color: hsl(var(--primary-hsl), 0.3);
        }

        .btn-success {
            background-color: hsl(var(--success-hsl));
            color: white;
        }

        .btn-success:hover {
            background-color: hsl(var(--success-hsl), 0.9);
            box-shadow: var(--shadow-md);
        }

        /* Filter Cards */
        .filters-card {
            background: hsl(var(--surface-hsl));
            border-radius: var(--radius-lg);
            padding: 20px;
            box-shadow: var(--shadow-sm);
            border: 1px solid hsl(var(--border-hsl));
            margin-bottom: 24px;
        }

        .filter-input, .form-input, .form-select, .form-textarea, .editor-input, .editor-select, .editor-textarea {
            width: 100%;
            padding: 8px 12px;
            border: 1px solid hsl(var(--border-hsl));
            border-radius: var(--radius-md);
            font-size: 0.875rem;
            color: hsl(var(--text-main-hsl));
            background-color: hsl(var(--surface-hsl));
            transition: var(--transition);
            outline: none;
        }

        .filter-input:focus, .form-input:focus, .form-select:focus, .form-textarea:focus, .editor-input:focus, .editor-select:focus, .editor-textarea:focus {
            border-color: hsl(var(--primary-hsl));
            box-shadow: 0 0 0 3px hsl(var(--primary-hsl), 0.15);
        }

        .filter-label, .form-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: hsl(var(--text-muted-hsl));
            margin-bottom: 6px;
            display: block;
        }

        /* Modals Premium */
        .modal-container, .report-editor-container {
            background: hsl(var(--surface-hsl));
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-lg);
            border: 1px solid hsl(var(--border-hsl));
            overflow: hidden;
        }

        .modal-header, .panel-header {
            background-color: hsl(var(--bg-body-hsl));
            border-bottom: 1px solid hsl(var(--border-hsl));
            padding: 16px 24px;
            font-weight: 600;
            color: hsl(var(--text-main-hsl));
        }

        .modal-body {
            padding: 24px;
        }

        .close-btn {
            color: hsl(var(--text-muted-hsl));
            transition: var(--transition);
        }

        .close-btn:hover {
            color: hsl(var(--danger-hsl));
            background-color: hsl(var(--danger-hsl), 0.1);
            border-radius: 50%;
        }

        /* Action icons in table */
        .report-table .btn-icon, .report-table button[class*="btn"] {
            padding: 6px;
            border-radius: var(--radius-md);
            color: hsl(var(--text-muted-hsl));
            background: transparent;
            border: 1px solid transparent;
            transition: var(--transition);
        }

        .report-table button:hover {
            color: hsl(var(--primary-hsl));
            background: hsl(var(--primary-light-hsl));
            border-color: hsl(var(--primary-light-hsl));
        }
        
        /* Dashboard Header */
        .dashboard-header {
            background: hsl(var(--surface-hsl));
            border-bottom: 1px solid hsl(var(--border-hsl));
            box-shadow: var(--shadow-sm);
        }
        
        /* Form Grids */
        .form-grid-2col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
        }
        
        /* Inputs with inline buttons */
        .inline-group {
            display: flex;
            gap: 8px;
        }
        
        .inline-group .form-input {
            flex: 1;
        }
        
        .form-divider {
            border: 0;
            border-top: 1px solid hsl(var(--border-hsl));
            margin: 24px 0;
        }
    </style>
"""

content = content.replace('</head>', f'{premium_css}\n</head>')

with open(html_path, "w", encoding="utf-8") as f:
    f.write(content)
print("done")
