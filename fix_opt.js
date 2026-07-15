const fs = require('fs');
let reportes = fs.readFileSync('reportes.js', 'utf8');

const renderTableRegex = /filteredByService\.forEach\(\(item, index\) => \{[\s\S]*?tableBody\.appendChild\(row\);\s*\}\);/;

const optimizedRenderLoop = `
        // OPTIMIZACIÓN DE PERFORMANCE: Usar DocumentFragment para evitar Layout Thrashing
        const fragment = document.createDocumentFragment();

        filteredByService.forEach((item, index) => {
            const row = document.createElement('tr');

            // Determinar clases de estado (Protegido contra nulos)
            const paymentClass = item.pagado ? 'payment-completed' : 'payment-pending';
            const dateClass = item.atrasado ? 'date-delay' : 'date-normal';

            // Formatear monedas de forma segura previniendo crashes
            const costoVal = parseFloat(item.costo) || 0;
            const adelantoVal = parseFloat(item.adelanto) || 0;
            const costoText = \`S/ \${costoVal.toFixed(2)}\`;
            const adelantoText = \`S/ \${adelantoVal.toFixed(2)}\`;

            // Formatear el nombre de paciente previniendo crasheos por undefined
            let pacienteName = item.paciente || '';
            if (pacienteName.includes(',')) {
                const parts = pacienteName.split(',');
                pacienteName = \`\${parts[0].trim()} \${(parts[1] || '').trim()}\`;
            }

            row.innerHTML = \`
                <td>\${index + 1}</td>
                <td><strong>\${item.codAtencion || '---'}</strong></td>
                <td>\${item.dni || '---'}</td>
                <td>\${item.medSolicitante || '---'}</td>
                <td>\${pacienteName}</td>
                <td>\${item.especimen || '---'}</td>
                <td class="\${paymentClass}">\${costoText}</td>
                <td class="\${paymentClass}">\${adelantoText}</td>
                <td style="text-align: center;">\${formatDisplayDate(item.fecRegistro || '')}</td>
                <td class="\${dateClass}">\${formatDisplayDate(item.fecEntrega || '')}</td>
                <td class="action-cell">
                    <button class="action-btn edit-btn" title="Editar Registro" onclick="handleAction('editar', '\${item.codAtencion}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn" title="Ver Detalles" onclick="handleAction('ver', '\${item.codAtencion}')">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn" title="Imprimir Reporte" onclick="handleAction('pdf', '\${item.codAtencion}')">
                        <i class="fa-solid fa-file-lines"></i>
                    </button>
                </td>
                <td class="action-cell">
                    <button class="action-btn delete-btn" title="Eliminar Registro" onclick="handleAction('eliminar', '\${item.codAtencion}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            \`;

            fragment.appendChild(row);
        });

        // Inyectar todo al DOM en una sola operación (Mejora radical de velocidad de renderizado)
        tableBody.appendChild(fragment);
`;

reportes = reportes.replace(renderTableRegex, optimizedRenderLoop.trim());

// Proteger parseCodAtencionForSort
reportes = reportes.replace(
    /const codStr = String\(cod\)\.trim\(\)\.toUpperCase\(\);/,
    "const codStr = String(cod || '').trim().toUpperCase();"
);

fs.writeFileSync('reportes.js', reportes);
