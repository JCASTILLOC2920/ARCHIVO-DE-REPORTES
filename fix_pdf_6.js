const fs = require('fs');
let html = fs.readFileSync('imprimir.html', 'utf8');

const regex = /if \(isAutoDownload\) \{[\s\S]*?worker\.save\(\)\.then\(\(\) => \{[\s\S]*?setTimeout\(\(\) => window\.close\(\), 500\);[\s\S]*?\}\);/;

const replacement = `if (isAutoDownload) {
                    worker.save().then(() => {
                        // Reemplazar la asquerosidad del HTML crudo con un mensaje amigable
                        document.body.innerHTML = \`
                            <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100vh; font-family:Arial,sans-serif; background-color:#f4f7f6;">
                                <div style="background:white; padding:40px; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.1); text-align:center;">
                                    <h2 style="color:#22c55e; margin-bottom:15px;">✔️ PDF Generado Exitosamente</h2>
                                    <p style="color:#555; font-size:16px; margin-bottom:25px;">El cuadro de descarga está activo. Seleccione dónde guardar su archivo.</p>
                                    <p style="color:#888; font-size:14px; margin-bottom:25px;">Nombre del archivo:<br><strong style="color:#333;">\${fileNameStr}</strong></p>
                                    <button onclick="window.close()" style="background:#3b82f6; color:white; border:none; padding:12px 24px; border-radius:5px; font-size:16px; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.1);">Cerrar Ventana</button>
                                </div>
                            </div>
                        \`;
                    });`;

if (regex.test(html)) {
    html = html.replace(regex, replacement);
    fs.writeFileSync('imprimir.html', html);
    console.log("Success");
} else {
    console.log("Regex no encontrado");
}
