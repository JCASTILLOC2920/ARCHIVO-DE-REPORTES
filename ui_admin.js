import { usersDatabase, categoriesDatabase, doctorsDatabase, defaultCategories, templatesDatabase } from "./db_service.js?v=3.2";
const supabase = window.supabase;
const usingSupabase = !!(supabase && window.SUPABASE_CONFIG);

let filteredUsers = [];
export let currentUserPage = 1;
let userPageLength = 10;
let filteredCategories = [];
export let currentCategoryPage = 1;
let categoryPageLength = 10;
let activeTemplateTab = "Macroscopica";
let currentCategoryId = null;
let filteredDoctors = [];
export let currentDoctorPage = 1;
let doctorPageLength = 10;
let editingDoctorIndex = null;

const showToast = window.showToast || function(m){console.log(m)};


export function initAdminUI() {
    document.querySelectorAll('.nav-item-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if (target === 'doctor') {
                loadDoctorsData();
            } else if (target === 'usuario') {
                loadUsersData();
            } else if (target === 'plantilla' || target === 'template') {
                loadCategoriesData();
            }
        });
    });

    const doctorsSearchInput = document.getElementById('doctorsSearchInput');
    if (doctorsSearchInput) doctorsSearchInput.addEventListener('input', applyDoctorFilters);

    const doctorsPageLength = document.getElementById('doctorsPageLength');
    if (doctorsPageLength) doctorsPageLength.addEventListener('change', renderDoctorsTable);

    const btnNuevoDoctor = document.getElementById('btnNuevoDoctor');
    if (btnNuevoDoctor) btnNuevoDoctor.addEventListener('click', () => openDoctorModal());

    const usersSearchInput = document.getElementById('usersSearchInput');
    if (usersSearchInput) usersSearchInput.addEventListener('input', applyUserFilters);

    const usersPageLength = document.getElementById('usersPageLength');
    if (usersPageLength) usersPageLength.addEventListener('change', renderUsersTable);

    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    if (btnNuevoUsuario) {
        btnNuevoUsuario.addEventListener('click', () => {
            if (usersDatabase.some(u => u.isNew)) {
                showToast('Ya hay un nuevo usuario en edición.', 'warning');
                return;
            }
            const nextId = usersDatabase.length > 0 ? Math.max(...usersDatabase.map(u => u.id || 0)) + 1 : 1;
            const draftUser = { id: nextId, perfil: 'Usuario', dni: '', nombres: '', usuario: '', clave: '', isNew: true };
            usersDatabase.unshift(draftUser);
            applyUserFilters();
        });
    }

    const categoriesSearchInput = document.getElementById('categoriesSearchInput');
    if (categoriesSearchInput) categoriesSearchInput.addEventListener('input', applyCategoryFilters);

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const catNombre = document.getElementById('catNombre').value.trim();
            if (!catNombre) { showToast('Ingrese un nombre', 'error'); return; }
            const newId = categoriesDatabase.length > 0 ? Math.max(...categoriesDatabase.map(x => x.id)) + 1 : 1;
            categoriesDatabase.unshift({ id: newId, tipo: activeTemplateTab, categoria: catNombre });
            localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
            categoryForm.reset();
            applyCategoryFilters();
            showToast('Categoría guardada', 'success');
        });
    }

    const subtabMacro = document.getElementById('subtabMacro');
    const subtabMicro = document.getElementById('subtabMicro');
    if (subtabMacro && subtabMicro) {
        subtabMacro.addEventListener('click', () => { activeTemplateTab = 'Macroscopica'; applyCategoryFilters(); });
        subtabMicro.addEventListener('click', () => { activeTemplateTab = 'Microscopica'; applyCategoryFilters(); });
    }
}

function loadUsersData() {
        applyUserFilters();
    }

function applyUserFilters() {
        const query = (document.getElementById('usersSearchInput')?.value || '').trim().toLowerCase();

        filteredUsers = usersDatabase.filter(u => {
            const perfil = (u.perfil || '').toLowerCase();
            const dni = (u.dni || '').toString().toLowerCase();
            const nombres = (u.nombres || '').toLowerCase();
            const usuario = (u.usuario || '').toLowerCase();
            const clave = (u.clave || '').toLowerCase();

            return perfil.includes(query) ||
                dni.includes(query) ||
                nombres.includes(query) ||
                usuario.includes(query) ||
                clave.includes(query);
        });

        currentUserPage = 1;
        renderUsersTable();
    }

function renderUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('usersPageLength')?.value || '10';
        userPageLength = lengthVal === 'all' ? filteredUsers.length : parseInt(lengthVal, 10);

        const totalRecords = filteredUsers.length;
        const totalPages = Math.ceil(totalRecords / userPageLength) || 1;

        if (currentUserPage > totalPages) {
            currentUserPage = totalPages;
        }

        const startIndex = (currentUserPage - 1) * userPageLength;
        const endIndex = Math.min(startIndex + userPageLength, totalRecords);

        const pageRecords = filteredUsers.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de usuarios.
                    </td>
                </tr>
            `;
            const infoDiv = document.getElementById('usersTableInfo');
            if (infoDiv) infoDiv.innerText = 'Mostrando 0 a 0 de 0 registros';
            renderUsersPagination(totalPages);
            return;
        }

        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            if (item.isNew || item.isEditing) {
                row.innerHTML = `
                    <td>${rowIndex}</td>
                    <td>
                        <select class="user-inline-perfil filter-input" style="padding:4px; width:100%;">
                            <option value="Administrador" ${item.perfil === 'Administrador' ? 'selected' : ''}>Administrador</option>
                            <option value="Usuario" ${item.perfil === 'Usuario' || item.perfil === 'Personal' ? 'selected' : ''}>Usuario</option>
                        </select>
                    </td>
                    <td>
                        <input type="text" class="user-inline-dni filter-input" value="${item.dni || ''}" placeholder="DNI" style="padding:4px; width:100%;">
                    </td>
                    <td>
                        <input type="text" class="user-inline-nombres filter-input" value="${item.nombres || ''}" placeholder="Nombre Completo" style="padding:4px; width:100%; text-transform: uppercase;">
                    </td>
                    <td>
                        <input type="text" class="user-inline-usuario filter-input" value="${item.usuario || ''}" placeholder="Usuario" style="padding:4px; width:100%;">
                    </td>
                    <td>
                        <input type="text" class="user-inline-clave filter-input" value="${item.clave || ''}" placeholder="Clave" style="padding:4px; width:100%;">
                    </td>
                    <td class="action-cell" colspan="3" style="text-align: center;">
                        <button type="button" class="action-btn save-btn" style="color: #22c55e; margin-right: 10px;" title="Guardar Usuario" onclick="saveInlineUser(${startIndex + index})">
                            <i class="fa-solid fa-floppy-disk"></i>
                        </button>
                        <button type="button" class="action-btn delete-btn" style="color: #ef4444;" title="Cancelar" onclick="cancelInlineUser(${startIndex + index})">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </td>
                `;
            } else {
                row.innerHTML = `
                    <td>${rowIndex}</td>
                    <td>${item.perfil === 'Personal' ? 'Usuario' : item.perfil}</td>
                    <td>${item.dni}</td>
                    <td>${item.nombres.toUpperCase()}</td>
                    <td>${item.usuario || '---'}</td>
                    <td>${item.clave || '---'}</td>
                    <td class="action-cell">
                        <button type="button" class="action-btn edit-btn" title="Editar Usuario" onclick="handleUserAction('editar', ${startIndex + index})">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                    </td>
                    <td class="action-cell">
                        <button type="button" class="action-btn lock-btn" style="color: #475569;" title="Bloquear/Desbloquear Usuario" onclick="handleUserAction('bloquear', ${startIndex + index})">
                            <i class="fa-solid fa-lock"></i>
                        </button>
                    </td>
                    <td class="action-cell">
                        <button type="button" class="action-btn approve-btn" style="color: #22c55e;" title="Activar/Desactivar Usuario" onclick="handleUserAction('aprobar', ${startIndex + index})">
                            <i class="fa-solid fa-circle-check"></i>
                        </button>
                    </td>
                `;
            }
            tbody.appendChild(row);
        });

        // Update info text
        const infoDiv = document.getElementById('usersTableInfo');
        if (infoDiv) {
            infoDiv.innerText = `Mostrando del ${startIndex + 1} al ${endIndex} de un total: ${totalRecords} registros`;
        }

        renderUsersPagination(totalPages);
    }

function renderUsersPagination(totalPages) {
        const container = document.getElementById('usersPagination');
        if (!container) return;

        container.innerHTML = '';

        // Anterior button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerText = 'Anterior';
        prevBtn.disabled = currentUserPage === 1;
        prevBtn.onclick = () => {
            if (currentUserPage > 1) {
                currentUserPage--;
                renderUsersTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentUserPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentUserPage = i;
                renderUsersTable();
            };
            container.appendChild(pageBtn);
        }

        // Siguiente button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerText = 'Siguiente';
        nextBtn.disabled = currentUserPage === totalPages;
        nextBtn.onclick = () => {
            if (currentUserPage < totalPages) {
                currentUserPage++;
                renderUsersTable();
            }
        };
        container.appendChild(nextBtn);
    }

function loadCategoriesData() {
        applyCategoryFilters();
    }

function applyCategoryFilters() {
        const query = (document.getElementById('categoriesSearchInput')?.value || '').trim().toLowerCase();

        filteredCategories = categoriesDatabase.filter(c => {
            const tipo = (c.tipo || '').toLowerCase();
            const cat = (c.categoria || '').toLowerCase();

            return tipo === activeTemplateTab.toLowerCase() && cat.includes(query);
        });

        renderCategoriesList();
    }

function renderCategoriesList() {
        const container = document.getElementById('categoriesListContainer');
        if (!container) return;

        container.innerHTML = '';

        if (filteredCategories.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 0.9rem;">
                    No se encontraron categorías.
                </div>
            `;
            return;
        }

        filteredCategories.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'category-item-btn';
            btn.style.cssText = `
                display: flex; justify-content: space-between; align-items: center;
                width: 100%; padding: 12px 15px; background: white; border: 1px solid #e2e8f0;
                border-radius: 6px; cursor: pointer; transition: all 0.2s; text-align: left;
                color: #334155; font-weight: 500;
            `;

            // Hover effect can be added via class or inline events
            btn.onmouseenter = () => { if (!btn.classList.contains('active-cat')) btn.style.background = '#f8fafc'; };
            btn.onmouseleave = () => { if (!btn.classList.contains('active-cat')) btn.style.background = 'white'; };

            btn.innerHTML = `
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.categoria.toUpperCase()}</span>
                <div style="display: flex; gap: 8px;">
                    <i class="fa-solid fa-pencil" style="color: #64748b; font-size: 0.85rem;" title="Editar" onclick="event.stopPropagation(); handleCategoryAction('editar', ${index})"></i>
                    <i class="fa-solid fa-trash" style="color: #ef4444; font-size: 0.85rem;" title="Eliminar" onclick="event.stopPropagation(); handleCategoryAction('eliminar', ${index})"></i>
                </div>
            `;

            btn.onclick = () => {
                // Remove active styling from all
                document.querySelectorAll('.category-item-btn').forEach(b => {
                    b.classList.remove('active-cat');
                    b.style.background = 'white';
                    b.style.borderColor = '#e2e8f0';
                    b.style.color = '#334155';
                });

                // Add active styling
                btn.classList.add('active-cat');
                btn.style.background = '#f0f9ff';
                btn.style.borderColor = '#38bdf8';
                btn.style.color = '#0369a1';

                showTemplatesForCategory(item);
            };

            container.appendChild(btn);
        });
    }

async function loadDoctorsData() {
        if (doctorsDatabase.length > 0) {
            applyDoctorFilters();
            return;
        }

        try {
            const response = await fetch('doctores.json');
            if (!response.ok) throw new Error('Error al leer doctores.json');
            const data = await response.json();
            doctorsDatabase.length = 0;
            data.forEach(d => doctorsDatabase.push(d));

            // Llenar el select de Med. Solicitante en el modal de registro de paciente
            populateModalDoctorsSelect();

            applyDoctorFilters();
        } catch (error) {
            console.error('Error al cargar la lista de doctores:', error);
            if (window.location.protocol === 'file:') {
                showToast('Aviso: Ejecute la app con un servidor local (ej: Live Server) para cargar la lista de doctores.json debido a restricciones del navegador.', 'info');
            } else {
                showToast('Error al cargar la lista de doctores desde el servidor.', 'error');
            }
        }
    }

function applyDoctorFilters() {
        const query = (document.getElementById('doctorsSearchInput')?.value || '').trim().toLowerCase();

        filteredDoctors = doctorsDatabase.filter(d => {
            const name = (d.doctor || '').toLowerCase();
            const tipo = (d.tipo || '').toLowerCase();
            const prov = (d.provincia || '').toLowerCase();
            const esp = (d.especializacion || '').toLowerCase();
            const col = (d.colegiado || '').toString().toLowerCase();
            const tel = (d.telefono || '').toString().toLowerCase();
            const mail = (d.correo || '').toLowerCase();

            return name.includes(query) ||
                tipo.includes(query) ||
                prov.includes(query) ||
                esp.includes(query) ||
                col.includes(query) ||
                tel.includes(query) ||
                mail.includes(query);
        });

        currentDoctorPage = 1;
        renderDoctorsTable();
    }

function renderDoctorsTable() {
        const tbody = document.getElementById('doctorsTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        const lengthVal = document.getElementById('doctorsPageLength')?.value || '10';
        doctorPageLength = lengthVal === 'all' ? filteredDoctors.length : parseInt(lengthVal, 10);

        const totalRecords = filteredDoctors.length;
        const totalPages = Math.ceil(totalRecords / doctorPageLength) || 1;

        if (currentDoctorPage > totalPages) {
            currentDoctorPage = totalPages;
        }

        const startIndex = (currentDoctorPage - 1) * doctorPageLength;
        const endIndex = Math.min(startIndex + doctorPageLength, totalRecords);

        const pageRecords = filteredDoctors.slice(startIndex, endIndex);

        if (pageRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 20px; color: #64748b;">
                        No se encontraron registros de doctores.
                    </td>
                </tr>
            `;
            renderDoctorsPagination(totalPages);
            return;
        }

        pageRecords.forEach((item, index) => {
            const rowIndex = startIndex + index + 1;
            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${rowIndex}</td>
                <td><strong>${item.tipo || '---'}</strong></td>
                <td>${item.provincia || '---'}</td>
                <td><strong>${item.doctor || '---'}</strong></td>
                <td>${item.especializacion || '---'}</td>
                <td>${item.colegiado || '---'}</td>
                <td>${item.telefono || '---'}</td>
                <td>${item.correo || '---'}</td>
                <td>${item.firma || '---'}</td>
                <td class="action-cell">
                    <button type="button" class="action-btn edit-btn" title="Editar Doctor" onclick="handleDoctorAction('editar', ${startIndex + index})">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn" style="color: #22c55e;" title="Validar Doctor" onclick="handleDoctorAction('validar', ${startIndex + index})">
                        <i class="fa-solid fa-circle-check"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button type="button" class="action-btn delete-btn" title="Eliminar Doctor" onclick="handleDoctorAction('eliminar', ${startIndex + index})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        renderDoctorsPagination(totalPages);
    }

function renderDoctorsPagination(totalPages) {
        const container = document.getElementById('doctorsPagination');
        if (!container) return;

        container.innerHTML = '';

        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.type = 'button';
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
        prevBtn.disabled = currentDoctorPage === 1;
        prevBtn.onclick = () => {
            if (currentDoctorPage > 1) {
                currentDoctorPage--;
                renderDoctorsTable();
            }
        };
        container.appendChild(prevBtn);

        // Page buttons
        let startPage = Math.max(1, currentDoctorPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.type = 'button';
            pageBtn.className = `pagination-btn ${i === currentDoctorPage ? 'active' : ''}`;
            pageBtn.innerText = i;
            pageBtn.onclick = () => {
                currentDoctorPage = i;
                renderDoctorsTable();
            };
            container.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.type = 'button';
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
        nextBtn.disabled = currentDoctorPage === totalPages;
        nextBtn.onclick = () => {
            if (currentDoctorPage < totalPages) {
                currentDoctorPage++;
                renderDoctorsTable();
            }
        };
        container.appendChild(nextBtn);
    }

function openDoctorModal(index = null) {
        editingDoctorIndex = index;
        const titleEl = document.getElementById('doctorModalTitle');

        if (index !== null) {
            if (titleEl) titleEl.innerText = 'Editar Doctor';
            const doc = filteredDoctors[index];
            if (doc) {
                (function(){ const el = document.getElementById('d_tipo'); if(el) { el.value = doc.tipo || 'DR. CLIENTE'; } else { console.warn('Missing element: d_tipo'); } })();
                (function(){ const el = document.getElementById('d_provincia'); if(el) { el.value = doc.provincia || ''; } else { console.warn('Missing element: d_provincia'); } })();
                (function(){ const el = document.getElementById('d_doctor'); if(el) { el.value = doc.doctor || ''; } else { console.warn('Missing element: d_doctor'); } })();
                (function(){ const el = document.getElementById('d_especializacion'); if(el) { el.value = doc.especializacion || ''; } else { console.warn('Missing element: d_especializacion'); } })();
                (function(){ const el = document.getElementById('d_colegiado'); if(el) { el.value = doc.colegiado || ''; } else { console.warn('Missing element: d_colegiado'); } })();
                (function(){ const el = document.getElementById('d_telefono'); if(el) { el.value = doc.telefono || ''; } else { console.warn('Missing element: d_telefono'); } })();
                (function(){ const el = document.getElementById('d_correo'); if(el) { el.value = doc.correo || ''; } else { console.warn('Missing element: d_correo'); } })();
            }
        } else {
            if (titleEl) titleEl.innerText = 'Registrar Doctor';
            if (doctorForm) doctorForm.reset();
        }

        if (doctorModalOverlay) doctorModalOverlay.classList.add('active');
    }

function closeDoctorModal() {
        if (typeof doctorModalOverlay !== 'undefined' && doctorModalOverlay) doctorModalOverlay.classList.remove('active');
        if (typeof doctorForm !== 'undefined' && doctorForm) doctorForm.reset();
        editingDoctorIndex = null;
    }

function populateModalDoctorsSelect() {
        const datalist = document.getElementById('medicosList');
        const datalist2 = document.getElementById('medicosListEditor');
        if (!datalist && !datalist2) return;

        if (datalist) datalist.innerHTML = '';
        if (datalist2) datalist2.innerHTML = '';

        // Obtener médicos únicos
        const uniqueDoctors = [...new Set(doctorsDatabase
            .map(d => d.doctor.trim().toUpperCase())
            .filter(name => name && name !== 'SIN DATOS' && !name.includes('---'))
        )].sort();

        uniqueDoctors.forEach(doc => {
            if (datalist) {
                const option = document.createElement('option');
                option.value = doc;
                datalist.appendChild(option);
            }
            if (datalist2) {
                const option2 = document.createElement('option');
                option2.value = doc;
                datalist2.appendChild(option2);
            }
        });
    }

window.handleUserAction = function (action, globalIndex) {
        const user = filteredUsers[globalIndex];
        if (!user) return;

        if (action === 'editar') {
            if (usersDatabase.some(u => u.isNew || u.isEditing)) {
                showToast('Ya hay un usuario en edición o borrador. Guarde o cancele antes de continuar.', 'warning');
                return;
            }
            user.isEditing = true;
            renderUsersTable();
        } else if (action === 'bloquear') {
            showToast(`Usuario ${user.nombres} bloqueado/desbloqueado con éxito.`, 'success');
        } else if (action === 'aprobar') {
            showToast(`Estado de usuario ${user.nombres} cambiado.`, 'success');
        }
    };

window.handleCategoryAction = function (action, globalIndex) {
        const cat = filteredCategories[globalIndex];
        if (!cat) return;

        if (action === 'editar') {
            const newName = prompt('Editar nombre de la categoría:', cat.categoria);
            if (newName && newName.trim()) {
                const dbIndex = categoriesDatabase.findIndex(x => x.id === cat.id);
                if (dbIndex !== -1) {
                    categoriesDatabase[dbIndex].categoria = newName.trim();
                    localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));
                    applyCategoryFilters();

                    // Actualizar el título si esta categoría está abierta
                    if (currentCategoryId === cat.id) {
                        showTemplatesForCategory(categoriesDatabase[dbIndex]);
                    }
                    showToast('Categoría modificada con éxito.', 'success');
                }
            }
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar la categoría "${cat.categoria}" y TODAS sus plantillas permanentemente?`)) {
                // Eliminar plantillas hijas
                templatesDatabase = templatesDatabase.filter(t => t.categoryId !== cat.id);
                localStorage.setItem('plantillasDB', JSON.stringify(templatesDatabase));

                // Eliminar categoría
                categoriesDatabase = categoriesDatabase.filter(x => x.id !== cat.id);
                localStorage.setItem('categoriasDB', JSON.stringify(categoriesDatabase));

                applyCategoryFilters();

                if (currentCategoryId === cat.id) {
                    resetTemplatesView();
                }

                showToast('Categoría y sus plantillas eliminadas con éxito.', 'success');
            }
        }
    };

window.handleDoctorAction = function (action, globalIndex) {
        const doctor = filteredDoctors[globalIndex];
        if (!doctor) return;

        if (action === 'editar') {
            openDoctorModal(globalIndex);
        } else if (action === 'validar') {
            showToast(`Doctor "${doctor.doctor}" validado correctamente.`, 'success');
        } else if (action === 'eliminar') {
            if (confirm(`¿Está seguro de eliminar de forma permanente al doctor "${doctor.doctor}"?`)) {
                const viejoNombre = doctor.doctor;
                // Eliminar de filteredDoctors
                filteredDoctors.splice(globalIndex, 1);
                // Eliminar de doctorsDatabase
                const dbIndex = doctorsDatabase.findIndex(d => d.doctor === viejoNombre);
                if (dbIndex !== -1) {
                    doctorsDatabase.splice(dbIndex, 1);
                }

                if (usingSupabase) {
                    supabase
                        .from('doctores')
                        .delete()
                        .eq('nombre', viejoNombre)
                        .then(({ error }) => {
                            if (error) console.error("Error al eliminar doctor en Supabase:", error);
                        });
                }
                showToast(`Doctor "${viejoNombre}" eliminado.`, 'error');
                renderDoctorsTable();
                populateModalDoctorsSelect();
            }
        }
    };

window.saveInlineUser = function (globalIndex) {
        const startIndex = (currentUserPage - 1) * userPageLength;
        const domIndex = globalIndex - startIndex;
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        const row = tbody.children[domIndex];
        if (!row) return;

        const perfil = row.querySelector('.user-inline-perfil').value;
        const dni = row.querySelector('.user-inline-dni').value.trim();
        const nombres = row.querySelector('.user-inline-nombres').value.trim().toUpperCase();
        const usuario = row.querySelector('.user-inline-usuario').value.trim();
        const clave = row.querySelector('.user-inline-clave').value.trim();

        if (!dni || !nombres || !usuario || !clave) {
            showToast('Por favor complete todos los campos del usuario.', 'error');
            return;
        }

        const dbPerfil = perfil === 'Usuario' ? 'Personal' : perfil;

        const user = filteredUsers[globalIndex];
        if (!user) return;

        const isCreating = user.isNew;

        user.perfil = dbPerfil;
        user.dni = dni;
        user.nombres = nombres;
        user.usuario = usuario;
        user.clave = clave;
        delete user.isNew;
        delete user.isEditing;

        if (usingSupabase) {
            if (isCreating) {
                supabase
                    .from('usuarios')
                    .insert([{
                        perfil: dbPerfil,
                        dni: dni,
                        nombres: nombres,
                        usuario: usuario,
                        clave: clave
                    }])
                    .then(({ error }) => {
                        if (error) {
                            console.error("Error al guardar usuario en Supabase:", error);
                            showToast("Error al guardar usuario en la nube.", "error");
                        } else {
                            showToast(`Usuario "${nombres}" guardado en la nube.`, 'success');
                        }
                    });
            } else {
                supabase
                    .from('usuarios')
                    .update({
                        perfil: dbPerfil,
                        dni: dni,
                        nombres: nombres,
                        usuario: usuario,
                        clave: clave
                    })
                    .eq('id', user.id)
                    .then(({ error }) => {
                        if (error) {
                            console.error("Error al actualizar usuario en Supabase:", error);
                            showToast("Error al actualizar usuario en la nube.", "error");
                        } else {
                            showToast(`Usuario "${nombres}" actualizado en la nube.`, 'success');
                        }
                    });
            }
        }

        showToast(`Usuario "${nombres}" guardado con éxito.`, 'success');
        applyUserFilters();
    };

window.cancelInlineUser = function (globalIndex) {
        const user = filteredUsers[globalIndex];
        if (user) {
            if (user.isNew) {
                const dbIndex = usersDatabase.findIndex(u => u.id === user.id);
                if (dbIndex !== -1) {
                    usersDatabase.splice(dbIndex, 1);
                }
            } else {
                delete user.isEditing;
            }
        }
        applyUserFilters();
    };

