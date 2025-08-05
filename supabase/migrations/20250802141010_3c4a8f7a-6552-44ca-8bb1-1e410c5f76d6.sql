-- Crear usuarios ficticios en la tabla perfiles para pruebas
INSERT INTO public.perfiles (usuario_id, nombre_completo, email, puesto, bio, telefono) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Ana García', 'ana.garcia@empresa.com', 'Diseñadora UX/UI', 'Especialista en experiencia de usuario con 5 años de experiencia', '+34-600-123-456'),
('550e8400-e29b-41d4-a716-446655440002', 'Carlos Rodríguez', 'carlos.rodriguez@empresa.com', 'Desarrollador Full Stack', 'Desarrollador con experiencia en React, Node.js y bases de datos', '+34-600-234-567'),
('550e8400-e29b-41d4-a716-446655440003', 'María López', 'maria.lopez@empresa.com', 'Project Manager', 'Gestora de proyectos certificada PMP con 8 años de experiencia', '+34-600-345-678'),
('550e8400-e29b-41d4-a716-446655440004', 'Juan Martínez', 'juan.martinez@empresa.com', 'Desarrollador Frontend', 'Especialista en React, Vue.js y tecnologías frontend modernas', '+34-600-456-789'),
('550e8400-e29b-41d4-a716-446655440005', 'Laura Sánchez', 'laura.sanchez@empresa.com', 'QA Tester', 'Analista de calidad con experiencia en testing automatizado', '+34-600-567-890')
ON CONFLICT (usuario_id) DO NOTHING;

-- Asignar roles básicos a los usuarios ficticios
INSERT INTO public.roles_usuario (usuario_id, rol) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'miembro'),
('550e8400-e29b-41d4-a716-446655440002', 'miembro'),
('550e8400-e29b-41d4-a716-446655440003', 'director'),
('550e8400-e29b-41d4-a716-446655440004', 'miembro'),
('550e8400-e29b-41d4-a716-446655440005', 'miembro')
ON CONFLICT (usuario_id, rol) DO NOTHING;