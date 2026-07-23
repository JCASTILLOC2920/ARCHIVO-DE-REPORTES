path = r"c:\Users\DELL\OneDrive - Universidad Nacional Mayor de San Marcos\Escritorio\repositorio\ARCHIVO-DE-REPORTES\db_service.js"

with open(path, "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

target = """        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('id', { ascending: false });"""

replacement = """        const LIGHT_COLUMNS = 'id, service, cod_atencion, dni, med_solicitante, nombres, apellidos, paciente, costo, adelanto, resta, fec_registro, fec_entrega, pagado, atrasado, especimen, edad, sexo, doctor, motivo_estudio, casetes, f_contacto, tel_contacto';

        const { data, error } = await supabase
            .from('pacientes')
            .select(LIGHT_COLUMNS)
            .order('id', { ascending: false });"""

if target in content:
    new_content = content.replace(target, replacement, 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("SUCCESSFULLY UPDATED db_service.js!")
else:
    print("TARGET NOT FOUND!")
