export function generarNombreEstandarSolicitud(codigo, apellidos, nombres, extension) {
    const nombreLimpio = `${apellidos} ${nombres}`.toUpperCase().replace(/\s+/g, ' ').trim();
    return `${codigo} ${nombreLimpio}.${extension}`;
}

export function optimizarImagenSolicitud(fileOrBlob, calidad = 0.85, maxDimension = 2000) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Redimensionar si excede maxDimension
                if (width > maxDimension || height > maxDimension) {
                    if (width > height) {
                        height *= maxDimension / width;
                        width = maxDimension;
                    } else {
                        width *= maxDimension / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convertir a WebP o JPEG con la calidad especificada
                // Preferimos WebP por su eficiencia, si el navegador lo soporta.
                const mimeType = 'image/webp';
                canvas.toBlob((blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        // Fallback a JPEG si WebP no es soportado o falla
                        canvas.toBlob((jpegBlob) => {
                            if (jpegBlob) {
                                resolve(jpegBlob);
                            } else {
                                reject(new Error('Error al optimizar la imagen a WebP o JPEG.'));
                            }
                        }, 'image/jpeg', calidad);
                    }
                }, mimeType, calidad);

            };
            img.onerror = () => reject(new Error('Error al cargar la imagen.'));
            img.src = event.target.result;
        };
        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
        reader.readAsDataURL(fileOrBlob);
    });
}

export async function guardarSolicitudEnN8n(codigo, apellidos, nombres, imagenBlob) {
    const extension = imagenBlob.type.split('/')[1] || 'bin'; // 'jpeg', 'webp', 'png', etc.
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
            throw new Error(`Error al guardar solicitud en n8n: ${response.status} ${response.statusText} - ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fallo en la comunicación con n8n para guardar solicitud:', error);
        throw error;
    }
}
