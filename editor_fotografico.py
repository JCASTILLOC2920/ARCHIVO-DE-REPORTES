import os
import sys
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
import threading
import win32com.client
import pythoncom

# ==========================================
# ROBOT FOTOGRÁFICO: CORTANA -> PHOTOSHOP
# ==========================================

class PhotoshopRobot:
    def __init__(self, ui_callback=None):
        self.ui_callback = ui_callback
        self.activo = False

    def procesar_imagen(self, ruta_imagen):
        try:
            # Inicializar COM para el hilo actual
            pythoncom.CoInitialize()
            
            if self.ui_callback: self.ui_callback("Conectando con Adobe Photoshop...")
            
            # Lanzar o conectar a Photoshop
            ps = win32com.client.Dispatch("Photoshop.Application")
            
            if self.ui_callback: self.ui_callback(f"Abriendo: {os.path.basename(ruta_imagen)}")
            
            # Abrir documento
            doc = ps.Open(ruta_imagen)
            
            # Forzar a capa normal (si es Background, convertir a capa 0)
            try:
                ps.DoJavaScript("app.activeDocument.activeLayer.isBackgroundLayer = false;")
            except:
                pass
            
            if self.ui_callback: self.ui_callback("Adobe Sensei: Analizando Anatomía...")
            
            # SCRIPT DE AUTOMATIZACIÓN DE PHOTOSHOP (JSX)
            jsx_script = """
            // 1. Adobe Sensei AI: Seleccionar Sujeto (Pieza + Regla + Casette)
            var idautoCutout = stringIDToTypeID( "autoCutout" );
            var desc = new ActionDescriptor();
            var idsampleAllLayers = stringIDToTypeID( "sampleAllLayers" );
            desc.putBoolean( idsampleAllLayers, false );
            executeAction( idautoCutout, desc, DialogModes.NO );
            
            // 2. Expandir selección ligeramente para matar bordes (1px)
            var idExpn = charIDToTypeID( "Expn" );
            var descExpn = new ActionDescriptor();
            var idBy = charIDToTypeID( "By  " );
            descExpn.putUnitDouble( idBy, charIDToTypeID( "#Pxl" ), 1.000000 );
            executeAction( idExpn, descExpn, DialogModes.NO );

            // 3. Invertir Selección (Para seleccionar el fondo de papel)
            var idInvs = charIDToTypeID( "Invs" );
            executeAction( idInvs, undefined, DialogModes.NO );
            
            // 4. Rellenar de Blanco Puro Quirúrgico (RGB 255,255,255)
            var idFl = charIDToTypeID( "Fl  " );
            var descFl = new ActionDescriptor();
            var idUsng = charIDToTypeID( "Usng" );
            var idFlCn = charIDToTypeID( "FlCn" );
            var idWht = charIDToTypeID( "Wht " );
            descFl.putEnumerated( idUsng, idFlCn, idWht );
            var idOpct = charIDToTypeID( "Opct" );
            var idPrc = charIDToTypeID( "#Prc" );
            descFl.putUnitDouble( idOpct, idPrc, 100.000000 );
            var idMd = charIDToTypeID( "Md  " );
            var idNrml = charIDToTypeID( "Nrml" );
            descFl.putEnumerated( idMd, idNrml, idNrml );
            executeAction( idFl, descFl, DialogModes.NO );
            
            // 5. Invertir Selección de nuevo para tener el sujeto seleccionado
            executeAction( idInvs, undefined, DialogModes.NO );
            
            // 6. Recorte Cuadrado (1:1) Inteligente centrado en el sujeto
            var bounds = app.activeDocument.selection.bounds;
            var left = bounds[0].value;
            var top = bounds[1].value;
            var right = bounds[2].value;
            var bottom = bounds[3].value;
            
            var width = right - left;
            var height = bottom - top;
            var size = Math.max(width, height);
            
            // Padding del 10%
            var padding = size * 0.10;
            size = size + (padding * 2);
            
            var cx = left + (width/2);
            var cy = top + (height/2);
            
            var cropLeft = cx - (size/2);
            var cropTop = cy - (size/2);
            var cropRight = cx + (size/2);
            var cropBottom = cy + (size/2);
            
            app.activeDocument.crop(new Array(cropLeft, cropTop, cropRight, cropBottom));
            
            // 7. Deseleccionar
            var idsetd = charIDToTypeID( "setd" );
            var descSel = new ActionDescriptor();
            var idnull = charIDToTypeID( "null" );
            var ref = new ActionReference();
            var idChnl = charIDToTypeID( "Chnl" );
            var idfsel = charIDToTypeID( "fsel" );
            ref.putProperty( idChnl, idfsel );
            descSel.putReference( idnull, ref );
            var idT = charIDToTypeID( "T   " );
            var idOrdn = charIDToTypeID( "Ordn" );
            var idNone = charIDToTypeID( "None" );
            descSel.putEnumerated( idT, idOrdn, idNone );
            executeAction( idsetd, descSel, DialogModes.NO );
            
            // 8. Opcional: Aclarar niveles y saturación para igualar a Gemini
            // (Dejado para el médico, priorizamos el fondo blanco 1:1)
            """
            
            ps.DoJavaScript(jsx_script)
            
            if self.ui_callback: self.ui_callback("Cirugía Fotográfica Completada.")
            
            return True
        except Exception as e:
            print(f"Error en Photoshop: {e}")
            if self.ui_callback: self.ui_callback(f"ERROR: {str(e)[:40]}")
            return False
        finally:
            pythoncom.CoUninitialize()

# ==========================================
# INTERFAZ TÁCTICA (GUI)
# ==========================================
class VentanaEditor:
    def __init__(self, root):
        self.root = root
        self.root.title("Retoque Fotográfico Militar - Cortana")
        self.root.geometry("450x300")
        self.root.config(bg="#1e1e1e")
        self.root.attributes('-topmost', True)
        
        # Estilos
        style = ttk.Style()
        style.theme_use('clam')
        style.configure("TButton", padding=10, font=('Segoe UI', 10, 'bold'), background="#007acc", foreground="white")
        style.map("TButton", background=[('active', '#005999')])
        
        # Título
        tk.Label(root, text="MOTOR ADOBE SENSEI INYECTADO", font=("Segoe UI", 12, "bold"), bg="#1e1e1e", fg="#00d1ff").pack(pady=15)
        
        tk.Label(root, text="Este módulo tomará el control de Photoshop localmente\npara eliminar el fondo y cuadrar la imagen a 1:1.", 
                 font=("Segoe UI", 9), bg="#1e1e1e", fg="#aaaaaa", justify="center").pack(pady=5)
        
        # Estado
        self.lbl_estado = tk.Label(root, text="Esperando fotografía...", font=("Segoe UI", 10, "italic"), bg="#1e1e1e", fg="#f39c12")
        self.lbl_estado.pack(pady=15)
        
        # Botones
        self.btn_seleccionar = ttk.Button(root, text="SELECCIONAR FOTOGRAFÍA", command=self.iniciar_proceso)
        self.btn_seleccionar.pack(pady=10)
        
        self.btn_cerrar = tk.Button(root, text="Cerrar Módulo", command=self.root.destroy, bg="#c0392b", fg="white", bd=0, font=('Segoe UI', 9, 'bold'))
        self.btn_cerrar.pack(pady=15, ipadx=10, ipady=5)
        
        self.robot = PhotoshopRobot(ui_callback=self.actualizar_estado)

    def actualizar_estado(self, texto):
        self.root.after(0, lambda: self.lbl_estado.config(text=texto))

    def iniciar_proceso(self):
        ruta = filedialog.askopenfilename(
            title="Seleccionar Pieza Quirúrgica",
            filetypes=[("Imágenes", "*.jpg *.jpeg *.png *.tif *.tiff")]
        )
        if not ruta:
            return
            
        self.btn_seleccionar.config(state="disabled")
        
        def hilo_trabajo():
            exito = self.robot.procesar_imagen(ruta)
            self.root.after(0, lambda: self.finalizar_proceso(exito))
            
        threading.Thread(target=hilo_trabajo, daemon=True).start()

    def finalizar_proceso(self, exito):
        self.btn_seleccionar.config(state="normal")
        if exito:
            messagebox.showinfo("Operación Exitosa", "Photoshop ha terminado la cirugía fotográfica.\nVerifica el resultado y guárdalo.")
        else:
            messagebox.showerror("Fallo Táctico", "No se pudo conectar con Photoshop.\nAsegúrate de tener Adobe Photoshop instalado y configurado.")

if __name__ == "__main__":
    app = tk.Tk()
    ventana = VentanaEditor(app)
    app.mainloop()
