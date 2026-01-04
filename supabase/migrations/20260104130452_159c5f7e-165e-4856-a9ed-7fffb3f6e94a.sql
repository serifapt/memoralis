-- Create test service task (scheduled for next week)
INSERT INTO public.service_tasks (
  subscription_id,
  scheduled_for,
  status,
  checklist_json
)
VALUES (
  '18cb7715-2d38-4916-81e3-eb829fb67819',
  (now() + interval '7 days')::date,
  'scheduled',
  '[
    {"label": "Limpeza geral da campa", "done": false},
    {"label": "Remoção de ervas e detritos", "done": false},
    {"label": "Limpeza da lápide", "done": false},
    {"label": "Colocação de flores frescas", "done": false},
    {"label": "Fotografias antes/depois", "done": false}
  ]'::jsonb
);