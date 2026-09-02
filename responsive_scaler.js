<!DOCTYPE html>\r
<html lang=\"es\">\r
<head>\r
    <meta charset=\"UTF-8\">\r
    <script>\r
        (function() {\r
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));\r
            if (!currentUser) {\r
                window.location.replace('login.html');\r
            } else if (currentUser.perfil === 'Usuario') {\r
                window.location.replace('reportes.html');\r
            }\r
        })();\r
    </script>\r
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r
    <meta name=\"description\" content=\"Formulario de Registro de Pacientes Clínicos con validaciones, búsqueda por DNI y cálculo de fechas de entrega.\">\r
    <title>Registro de Pacientes</title>\r
    <!-- Optimizacion de Carga - Preloads al inicio -->\r
    <link rel=\"preload\" href=\"style.css?v=3.85\" as=\"style\">\r
    <!-- Escalador Matemático de Pantalla y Zoom -->\r
    <script src=\"responsive_scaler.js?v=1.0\"></script>\r
    \r
    <!-- Google Fonts: Inter para tipografía moderna -->\r
    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\r
    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\r
    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\" rel=\"stylesheet\">\r
    <!-- Estilos Premium Clínicos en línea para no afectar CSS global -->\r
    <style id=\"premium-clinical-theme\">\r
        :root {\r
            --clinical-blue: #0ea5e9;\r
            --clinical-dark-blue: #0284c7;\r
            --clinical-slate: #f1f5f9;\r
            --clinical-slate-dark: #cbd5e1;\r
            --clinical-text: #334155;\r
            --clinical-white: #ffffff;\r
            --clinical-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);\r
        }\r
        \r
        body, .app-container {\r
            background-color: var(--clinical-slate);\r
            color: var(--clinical-text);\r
            font-family: 'Inter', sans-serif;\r
        }\r
\r
        .sidebar {\r
            background-color: var(--clinical-white);\r
            border-right: 1px solid var(--clinical-slate-dark);\r
            box-shadow: var(--clinical-shadow);\r
        }\r
        \r