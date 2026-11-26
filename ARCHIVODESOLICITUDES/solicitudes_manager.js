// solicitudes_manager.js

/**
 * Genera un nombre de archivo estándar para la solicitud.
 * @param {string} codigo - Código de la solicitud.
 * @param {string} apellidos - Apellidos del paciente.
 * @param {string} nombres - Nombres del paciente.
 * @param {string} extension - Extensión del archivo (sin punto).
 * @returns {string} Nombre de archivo completo.
 */
export function generarNombreEstandarSolicitud(codigo, apellidos, nombres, extension) {
    const nombreLimpio = `${apellidos} ${nombres}`
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
    return `${codigo} ${nombreLimpio}.${extension}`;
}

/**
 * Optimiza una imagen (redimensiona y comprime) devolviendo un Blob.
 * @param {File|Blob} fileOrBlob - Imagen original.
 * @param {number} [calidad=0.85] - Calidad de compresión (0‑1).
 * @param {number} [maxDimension=2000] - Máxima dimensión (ancho o alto).
 * @returns {Promise<Blob>} Blob optimizado.
 */
export function optimizarImagenSolicitud(fileOrBlob, calidad = 0.85, maxDimension = 2000) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (event) => {
            try {
                const img = new Image();
                img.onload = () => {
                    // Calcular dimensiones manteniendo la proporción
                    let { width, height } = img;
                    if (width > maxDimension || height > maxDimension) {
                        if (width > height) {
                            height = Math.round((height * maxDimension) / width);
                            width = maxDimension;
                        } else {
                            width = Math.round((width * maxDimension) / height);
                            height = maxDimension;
                        }
                    }

                    const canvas = document.createElement('canvas');
                    canvas.width = Math.round(width);
                    canvas.height = Math.round(height);
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Intentar WebP primero
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                resolve(blob);
                                return;
                            }
                            // Fallback a JPEG
                            canvas.toBlob(
                                (jpegBlob) => {
                                    if (jpegBlob) {
                                        resolve(jpegBlob);
                                    } else {
                                        reject(new Error('No se pudo generar Blob de la imagen (WebP y JPEG fallaron).'));
                                    }
                                },
                                'image/jpeg',
                                calidad
                            );
                        },
                        'image/webp',
                        calidad
                    );
                };

                img.onerror = () => reject(new Error('Error al cargar la imagen para optimizar.'));
                img.src = event.target.result;
            } catch (e) {
                reject(e);
            }
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo de imagen.'));
        reader.readAsDataURL(fileOrBlob);
    });
}

/**
 * Envía la solicitud (imagen y metadatos) al endpoint n8n.
 * @param {string} codigo - Código de la solicitud.
 * @param {string} apellidos - Apellidos del paciente.
 * @param {string} nombres - Nombres del paciente.
 * @param {Blob} imagenBlob - Imagen optimizada.
 * @returns {Promise<Object>} Respuesta JSON del servidor.
 */
export async function guardarSolicitudEnN8n(codigo, apellidos, nombres, imagenBlob) {
    const extension = (imagenBlob.type.split('/')[1] || 'bin').replace(/^jpeg$/i, 'jpg');
    const nombreArchivo = generarNombreEstandarSolicitud(codigo, apellidos, nombres, extension);

    const formData = new FormData();
    formData.append('solicitud', imagenBlob, nombreArchivo);
    formData.append('codigo', codigo);
    formData.append('apellidos', apellidos);
    formData.append('nombres', nombres);
    formData.append('nombreArchivo', nombreArchivo);

    try {
        const response = await fetch('http://127.0.0.1:5678/webhook/guardar-solicitud', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Error al guardar solicitud en n8n: ${response.status} ${response.statusText} - ${errorText}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error('Fallo en la comunicación con n8n para guardar solicitud:', error);
        throw error;
    }
}
