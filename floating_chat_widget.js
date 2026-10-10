/**
 * floating_chat_widget.js
 * Versión ultra-compacta, limpia y directa del botón flotante de WhatsApp.
 * Esquina inferior derecha (bottom: 20px, right: 20px, z-index: 2147483647).
 * Popover minimalista de ~240px con accesos directos de 1 clic para cada clínica.
 */

(function () {
    if (window._floatingWhatsAppInitialized) return;
    window._floatingWhatsAppInitialized = true;

    // Crear estilos CSS ultra-compactos y limpios
    const styleEl = document.createElement('style');
    styleEl.id = 'floating-whatsapp-styles';
    styleEl.textContent = `
        #floating-whatsapp-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 2147483647;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        #wa-float-btn {
            width: 48px;
            height: 48px;
            background-color: #25D366;
            border: none;
            border-radius: 50%;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s;
            outline: none;
        }

        #wa-float-btn:hover {
            transform: scale(1.08);
            box-shadow: 0 6px 18px rgba(37, 211, 102, 0.45);
        }

        #wa-float-btn svg {
            width: 26px;
            height: 26px;
            fill: #ffffff;
        }

        /* Popover minimalista (~240px ancho) */
        #wa-popover {
            position: absolute;
            bottom: 60px;
            right: 0;
            width: 240px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            display: none;
            flex-direction: column;
            border: 1px solid #e2e8f0;
            animation: wa-fade-in 0.2s ease-out;
        }

        #wa-popover.open {
            display: flex;
        }

        @keyframes wa-fade-in {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .wa-popover-header {
            background: #075E54;
            color: #ffffff;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.82rem;
            font-weight: 600;
        }

        .wa-popover-close {
            background: none;
            border: none;
            color: #ffffff;
            font-size: 1.1rem;
            cursor: pointer;
            padding: 0 2px;
            opacity: 0.8;
            transition: opacity 0.15s;
        }

        .wa-popover-close:hover {
            opacity: 1;
        }

        .wa-popover-body {
            padding: 8px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            background: #f8fafc;
        }

        .wa-clinic-link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 10px;
            border-radius: 8px;
            text-decoration: none;
            color: #111b21;
            font-size: 0.78rem;
            font-weight: 500;
            background: #ffffff;
            border: 1px solid #e9edef;
            transition: all 0.15s ease;
        }

        .wa-clinic-link:hover {
            background: #dcf8c6;
            color: #075E54;
            border-color: #25D366;
            transform: translateX(2px);
        }

        .wa-clinic-link span {
            font-size: 0.9rem;
        }

        @media (max-width: 480px) {
            #floating-whatsapp-container {
                bottom: 16px;
                right: 16px;
            }
            #wa-float-btn {
                width: 44px;
                height: 44px;
            }
            #wa-float-btn svg {
                width: 24px;
                height: 24px;
            }
            #wa-popover {
                width: 220px;
            }
        }
    `;
    document.head.appendChild(styleEl);

    // Crear contenedor principal
    const container = document.createElement('div');
    container.id = 'floating-whatsapp-container';
    container.innerHTML = `
        <div id="wa-popover">
            <div class="wa-popover-header">
                <span>💬 WhatsApp Clínico</span>
                <button class="wa-popover-close" id="wa-close-btn" title="Cerrar">&times;</button>
            </div>
            <div class="wa-popover-body">
                <a href="https://wa.me/51999999991?text=Hola%2C%20necesito%20consulta%20con%20Cl%C3%ADnica%20Carri%C3%B3n" target="_blank" rel="noopener noreferrer" class="wa-clinic-link">
                    <span>🏥</span> Clínica Carrión
                </a>
                <a href="https://wa.me/51999999992?text=Hola%2C%20necesito%20consulta%20con%20Cl%C3%ADnica%20La%20Mujer" target="_blank" rel="noopener noreferrer" class="wa-clinic-link">
                    <span>🩺</span> Clínica La Mujer
                </a>
                <a href="https://wa.me/51999999993?text=Hola%2C%20necesito%20consulta%20con%20Cl%C3%ADnica%20Alfa%20Prevenir" target="_blank" rel="noopener noreferrer" class="wa-clinic-link">
                    <span>🔬</span> Clínica Alfa Prevenir
                </a>
                <a href="https://wa.me/51999999994?text=Hola%2C%20necesito%20consulta%20con%20Cl%C3%ADnica%20San%20Clemente" target="_blank" rel="noopener noreferrer" class="wa-clinic-link">
                    <span>⭐</span> Clínica San Clemente
                </a>
                <a href="https://wa.me/51999999999?text=Hola%2C%20necesito%20soporte%20general" target="_blank" rel="noopener noreferrer" class="wa-clinic-link" style="background: #f0fdf4; font-weight: 600;">
                    <span>🌐</span> WhatsApp General / Soporte
                </a>
            </div>
        </div>
        <button id="wa-float-btn" title="Abrir WhatsApp Clínico">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
        </button>
    `;
    document.body.appendChild(container);

    const btnFloat = document.getElementById('wa-float-btn');
    const popover = document.getElementById('wa-popover');
    const closeBtn = document.getElementById('wa-close-btn');

    function togglePopover(e) {
        if (e) e.stopPropagation();
        popover.classList.toggle('open');
    }

    btnFloat.addEventListener('click', togglePopover);
    closeBtn.addEventListener('click', togglePopover);

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
            popover.classList.remove('open');
        }
    });

    console.log('[Floating WhatsApp Widget] Ultra-compacto inicializado correctamente.');
})();
