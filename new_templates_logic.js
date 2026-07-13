    // --- NUEVA LÓGICA DE GESTOR DE PLANTILLAS (ESTILO DESKTOP) ---

    // Poblar combo de Especialidades
    function poblarComboEspecialidades() {
        const combo = document.getElementById('tplCategoria');
        if (!combo) return;
        combo.innerHTML = '<option value="">Seleccione especialidad...</option>';
        
        // Agrupar únicas
        const unicas = [...new Set(categoriesDatabase.map(c => c.categoria))].sort();
        unicas.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            combo.appendChild(opt);
        });
    }

    window.limpiarEditorPlantilla = function() {
        document.getElementById('templateForm').reset();
        document.getElementById('tplId').value = '';
    }

    function renderTemplatesTreeView() {
        const treeContainer = document.getElementById('templatesTreeView');
        if (!treeContainer) return;
        treeContainer.innerHTML = '';

        const searchTerm = (document.getElementById('tplSearch').value || '').toLowerCase();

        // Agrupar plantillas por categoría
        const grouped = {};
        categoriesDatabase.forEach(cat => {
            const catName = cat.categoria;
            if (!grouped[catName]) grouped[catName] = { id: cat.id, name: catName, templates: [] };
            
            const tpls = templatesDatabase.filter(t => t.categoryId === cat.id);
            tpls.forEach(t => {
                if (t.titulo.toLowerCase().includes(searchTerm) || catName.toLowerCase().includes(searchTerm)) {
                    grouped[catName].templates.push(t);
                }
            });
        });

        // Renderizar
        Object.values(grouped).sort((a,b) => a.name.localeCompare(b.name)).forEach(group => {
            if (group.templates.length === 0 && searchTerm) return; // Ocultar si no hay coincidencias en busqueda

            // Header Categoría
            const catRow = document.createElement('div');
            catRow.style.cssText = 'display: flex; padding: 8px 15px; background: #334155; color: white; cursor: pointer; border-bottom: 1px solid #1e293b; font-weight: 600; font-size: 0.9rem; align-items: center;';
            catRow.innerHTML = \
                <div style="flex: 2; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-caret-down"></i> \
                </div>
                <div style="flex: 0.5; text-align: center; color: #94a3b8; font-size: 0.8rem;"></div>
                <div style="flex: 2; color: #94a3b8; font-size: 0.8rem;">[\ plantillas]</div>
            \;
            treeContainer.appendChild(catRow);

            // Plantillas
            const tplContainer = document.createElement('div');
            group.templates.forEach(tpl => {
                const row = document.createElement('div');
                row.style.cssText = 'display: flex; padding: 8px 15px; background: #1e293b; color: #cbd5e1; border-bottom: 1px solid #0f172a; font-size: 0.85rem; cursor: pointer; transition: background 0.2s; align-items: center;';
                row.onmouseenter = () => row.style.background = '#0ea5e9';
                row.onmouseleave = () => row.style.background = '#1e293b';
                
                row.onclick = () => window.cargarEditorPlantilla(tpl.id);

                row.innerHTML = \
                    <div style="flex: 2; padding-left: 20px;"></div>
                    <div style="flex: 0.5; text-align: center;">\</div>
                    <div style="flex: 2; display: flex; justify-content: space-between; align-items: center;">
                        \
                        <button class="action-btn delete-btn" onclick="event.stopPropagation(); window.eliminarPlantilla(\)" style="background:none; border:none; color:#ef4444; cursor:pointer;" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                    </div>
                \;
                tplContainer.appendChild(row);
            });

            // Toggle logic
            catRow.onclick = () => {
                const icon = catRow.querySelector('i');
                if (tplContainer.style.display === 'none') {
                    tplContainer.style.display = 'block';
                    icon.className = 'fa-solid fa-caret-down';
                } else {
                    tplContainer.style.display = 'none';
                    icon.className = 'fa-solid fa-caret-right';
                }
            };

            treeContainer.appendChild(tplContainer);
        });
    }

    // Buscador
    const searchInput = document.getElementById('tplSearch');
    if (searchInput) {
        searchInput.addEventListener('input', renderTemplatesTreeView);
    }

    window.cargarEditorPlantilla = function(id) {
        const tpl = templatesDatabase.find(t => t.id === id);
        if (!tpl) return;
        
        document.getElementById('tplId').value = tpl.id;
        document.getElementById('tplTitulo').value = tpl.titulo || '';
        
        // Migración de datos viejos: Si tiene 'contenido' pero no macro/micro/diag, lo metemos a micro
        if (tpl.contenido && !tpl.micro) {
            document.getElementById('tplMicro').value = tpl.contenido;
        } else {
            document.getElementById('tplMicro').value = tpl.micro || '';
        }
        
        document.getElementById('tplMacro').value = tpl.macro || '';
        document.getElementById('tplDiag').value = tpl.diag || '';

        // Buscar categoría en la BD
        const catObj = categoriesDatabase.find(c => c.id === tpl.categoryId);
        if (catObj) {
            document.getElementById('tplCategoria').value = catObj.categoria;
        }
    }

    window.guardarPlantilla = function() {
        const idInput = document.getElementById('tplId').value;
        const titulo = document.getElementById('tplTitulo').value.trim();
        const macro = document.getElementById('tplMacro').value.trim();
        const micro = document.getElementById('tplMicro').value.trim();
        const diag = document.getElementById('tplDiag').value.trim();
        const catNombre = document.getElementById('tplCategoria').value;

        if (!titulo || !catNombre) {
            showToast('Especialidad y Nombre de plantilla son obligatorios.', 'error');
            return;
        }

        // Buscar o crear categoría en macro/micro
        let catObj = categoriesDatabase.find(c => c.categoria === catNombre);
        if (!catObj) {
            showToast('Categoría no encontrada.', 'error');
            return;
        }

        if (idInput) {
            // Actualizar
            const idx = templatesDatabase.findIndex(t => t.id == idInput);
            if (idx !== -1) {
                templatesDatabase[idx].titulo = titulo;
                templatesDatabase[idx].macro = macro;
                templatesDatabase[idx].micro = micro;
                templatesDatabase[idx].diag = diag;
                templatesDatabase[idx].categoryId = catObj.id;
                showToast('Plantilla actualizada.', 'success');
            }
        } else {
            // Crear
            const newId = templatesDatabase.length > 0 ? Math.max(...templatesDatabase.map(x => x.id)) + 1 : 1;
            templatesDatabase.push({
                id: newId,
                categoryId: catObj.id,
                titulo: titulo,
                macro: macro,
                micro: micro,
                diag: diag
            });
            showToast('Plantilla creada.', 'success');
        }

        localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
        window.limpiarEditorPlantilla();
        renderTemplatesTreeView();
    }

    window.eliminarPlantilla = function (id) {
        if (confirm('¿Está seguro de eliminar esta plantilla de forma permanente?')) {
            templatesDatabase = templatesDatabase.filter(t => t.id !== id);
            localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));
            renderTemplatesTreeView();
            window.limpiarEditorPlantilla();
            showToast('Plantilla eliminada.', 'success');
        }
    };

    // Al iniciar, poblar y renderizar
    if (document.getElementById('view-templates')) {
        poblarComboEspecialidades();
        renderTemplatesTreeView();
    }

    // Funciones globales exportadas previamente usadas (dummies para no romper)
    window.cerrarModalPlantilla = function() {};
    window.abrirModalPlantilla = function() {};

})();
