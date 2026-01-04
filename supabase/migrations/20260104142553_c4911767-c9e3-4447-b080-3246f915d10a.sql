-- 1. Atribuir tarefa existente ao técnico João Teste
UPDATE service_tasks 
SET assigned_to = '41ea5fd3-4518-40ac-984c-b09e2ba07a69'
WHERE id = '22061534-b19c-490a-af07-aa333eb25227';

-- 2. Criar mais tarefas de teste com diferentes estados
-- Tarefa agendada para amanhã
INSERT INTO service_tasks (id, subscription_id, scheduled_for, status, assigned_to) VALUES
('a2222222-2222-4222-8222-222222222222', '18cb7715-2d38-4916-81e3-eb829fb67819', NOW() + INTERVAL '1 day', 'scheduled', '41ea5fd3-4518-40ac-984c-b09e2ba07a69')
ON CONFLICT (id) DO NOTHING;

-- Tarefa em progresso
INSERT INTO service_tasks (id, subscription_id, scheduled_for, status, assigned_to) VALUES
('b3333333-3333-4333-8333-333333333333', '18cb7715-2d38-4916-81e3-eb829fb67819', NOW(), 'in_progress', '41ea5fd3-4518-40ac-984c-b09e2ba07a69')
ON CONFLICT (id) DO NOTHING;

-- Tarefa concluída (para histórico)
INSERT INTO service_tasks (id, subscription_id, scheduled_for, status, assigned_to, completed_at, technician_notes) VALUES
('c4444444-4444-4444-8444-444444444444', '18cb7715-2d38-4916-81e3-eb829fb67819', NOW() - INTERVAL '7 days', 'completed', '41ea5fd3-4518-40ac-984c-b09e2ba07a69', NOW() - INTERVAL '7 days', 'Limpeza completa realizada. Flores frescas colocadas.')
ON CONFLICT (id) DO NOTHING;

-- 3. Adicionar media de teste para tarefa concluída
INSERT INTO service_task_media (id, service_task_id, type, file_url, caption) VALUES
('d1111111-1111-4111-8111-111111111111', 'c4444444-4444-4444-8444-444444444444', 'before', 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=400', 'Antes da limpeza'),
('e2222222-2222-4222-8222-222222222222', 'c4444444-4444-4444-8444-444444444444', 'after', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', 'Após limpeza e flores')
ON CONFLICT (id) DO NOTHING;