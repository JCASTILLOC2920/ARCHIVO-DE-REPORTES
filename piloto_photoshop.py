import win32com.client
import cv2
import numpy as np
import os
import time

def calculate_correction(image_path):
    """Cerebro Matemático: Calcula la desviación cromática de la imagen"""
    img = cv2.imread(image_path)
    if img is None:
        raise Exception(f"No se pudo leer la imagen: {image_path}")
    
    b, g, r = cv2.split(img)
    p95_r = np.percentile(r, 95)
    p95_g = np.percentile(g, 95)
    p95_b = np.percentile(b, 95)
    
    print(f"[CEREBRO] Percentiles al 95%: R:{p95_r:.1f} G:{p95_g:.1f} B:{p95_b:.1f}")
    
    # Calcular déficit respecto al Verde (asumiendo que G es el cast dominante)
    deficit_b = max(0, p95_g - p95_b)
    deficit_r = max(0, p95_g - p95_r)
    
    print(f"[CEREBRO] Déficit detectado -> Azul: +{deficit_b:.1f}, Rojo: +{deficit_r:.1f}")
    return deficit_r, deficit_b

def inject_photoshop(image_path, deficit_r, deficit_b):
    """Brazo Ejecutor: Pilota Photoshop vía COM y JSX"""
    print("[BRAZO] Conectando con Adobe Photoshop...")
    ps = win32com.client.Dispatch("Photoshop.Application")
    
    # Asegurar que PS esté visible
    # ps.Visible = True 
    
    print(f"[BRAZO] Abriendo documento: {image_path}")
    doc = ps.Open(image_path)
    
    # Construir script JSX dinámico
    jsx_script = """
    // 1. Convertir la capa de fondo (Background) a capa normal para soportar transparencia/recorte
    var doc = app.activeDocument;
    if (doc.activeLayer.isBackgroundLayer) {
        doc.activeLayer.isBackgroundLayer = false;
        doc.activeLayer.name = "Layer 0";
    }

    // 2. Corregir Color Balance basado en los cálculos del Cerebro Matemático en Python
    // Color balance takes shadows, midtones, highlights.
    // We add Cyan/Red, Magenta/Green, Yellow/Blue.
    // deficit_r -> we need more Red (positive value in first param)
    // deficit_b -> we need more Blue (positive value in third param)
    var d_r = """ + str(min(100, int(deficit_r))) + """;
    var d_b = """ + str(min(100, int(deficit_b))) + """;
    
    // Aplicamos el ajuste a los Highlight/Midtones
    doc.activeLayer.adjustColorBalance([d_r, 0, d_b], [d_r/2, 0, d_b/2], [0,0,0], true);

    // 3. Seleccionar el fondo con Varita Mágica (esquina superior izquierda)
    var idsetd = charIDToTypeID( "setd" );
    var descM = new ActionDescriptor();
    var refM = new ActionReference();
    refM.putProperty( charIDToTypeID( "Chnl" ), charIDToTypeID( "fsel" ) );
    descM.putReference( charIDToTypeID( "null" ), refM );
    var descPos = new ActionDescriptor();
    descPos.putUnitDouble( charIDToTypeID( "Hrzn" ), charIDToTypeID( "#Pxl" ), 10.000000 );
    descPos.putUnitDouble( charIDToTypeID( "Vrtc" ), charIDToTypeID( "#Pxl" ), 10.000000 );
    descM.putObject( charIDToTypeID( "T   " ), charIDToTypeID( "Pnt " ), descPos );
    descM.putInteger( charIDToTypeID( "Tlrn" ), 45 ); // Tolerancia de color para el fondo blanco/gris
    descM.putBoolean( charIDToTypeID( "Cntg" ), true ); // Selección continua para proteger brillos del tejido
    executeAction( idsetd, descM, DialogModes.NO );

    // 4. Rellenar de Blanco Absoluto el fondo detectado
    var whiteColor = new SolidColor();
    whiteColor.rgb.red = 255;
    whiteColor.rgb.green = 255;
    whiteColor.rgb.blue = 255;
    
    try {
        doc.selection.fill(whiteColor);
        doc.selection.deselect();
    } catch(e) {
        // En caso de que no detecte selección (fondo muy complejo), simplemente continuamos
    }

    // 6. Expandir Canvas (Crop 1:1) manteniendo el centro
    var w = doc.width;
    var h = doc.height;
    var newSize = (w > h) ? w : h;
    doc.resizeCanvas(newSize, newSize, AnchorPosition.MIDDLECENTER);
    """
    
    print("[BRAZO] Inyectando comandos JSX (IA Adobe Sensei)...")
    ps.DoJavaScript(jsx_script)
    
    # 7. Guardar el archivo modificado
    output_dir = os.path.join(os.path.dirname(image_path), "OUTPUT_CLINICO")
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    filename = os.path.basename(image_path)
    base_name, ext = os.path.splitext(filename)
    out_path = os.path.join(output_dir, f"{base_name}_retouched.jpeg")
    
    print(f"[BRAZO] Guardando obra en: {out_path}")
    
    # Configurar opciones JPG
    jpgSaveOptions = win32com.client.Dispatch("Photoshop.JPEGSaveOptions")
    jpgSaveOptions.FormatOptions = 1 # Standard
    jpgSaveOptions.Quality = 12 # Maximum quality
    
    doc.SaveAs(out_path, jpgSaveOptions, True, 2) # True = As Copy, 2 = Lowercase extension
    doc.Close(2) # 2 = psDoNotSaveChanges (Cierra el original sin guardar cambios destructivos)
    
    print("[SISTEMA] Operación completada con éxito.")

if __name__ == "__main__":
    target = r"C:\Users\HP\Desktop\002.jpeg"
    print("========================================")
    print(" INICIANDO AUTOMATIZADOR HÍBRIDO (MACRO) ")
    print("========================================")
    try:
        def_r, def_b = calculate_correction(target)
        inject_photoshop(target, def_r, def_b)
    except Exception as e:
        print(f"[ERROR FATAL] {e}")
