# PULSO — Resumen del Proyecto Star CRM

## Análisis Completo (27 Ene 2026)

### Qué es
CRM para STAR Real Estate con 3 agentes IA (Emprendimientos, Inmuebles, Tasaciones) que califican leads de Instagram Ads vía WhatsApp usando metodología BANT. Los agentes conversan naturalmente en español rioplatense, con delay humanizado de 8-12 seg, y clasifican leads como Frío/Tibio/Caliente.

### Estado: ~40% completado

| Componente | Estado | Detalle |
|------------|--------|---------|
| Frontend (Vite+React+TS) | 90% ✅ | Dashboard, Inbox, Pipeline, Leads, Agentes, Propiedades, Config — todo deployado |
| Supabase DB | Tablas creadas ✅ | 7 tablas, 6/7 emprendimientos cargados, 1 agente (Jony). 0 leads/conversaciones |
| Frontend ↔ Supabase | 0% ❌ | `constants.ts` tiene datos mock hardcodeados (35KB). Supabase JS ya en package.json |
| Agentes IA (n8n) | 60% 🟡 | Workflow diseñado (8 nodos), falta conexión WhatsApp |
| WhatsApp API | 0% ❌ | Bloqueado: cliente no entregó credenciales |

### Arquitectura del Código

```
crm-star2026/
├── src/
│   ├── App.tsx          ← Router con 11 rutas
│   ├── types.ts         ← Interfaces TypeScript (Leads, Conversations, Pipeline, etc.)
│   ├── constants.ts     ← 35KB de datos MOCK (reemplazar con Supabase)
│   ├── components/      ← Sidebar, NotificationBell, cards, charts
│   ├── pages/           ← Dashboard, Inbox, Pipeline, Leads, Agentes, etc.
│   ├── contexts/        ← React contexts
│   ├── hooks/           ← Custom hooks
│   ├── lib/             ← Utilidades (probablemente supabase client)
│   └── types/           ← Types adicionales
├── package.json         ← @supabase/supabase-js YA instalado
├── .env.example         ← VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
└── vite.config.ts
```

### Hallazgos Clave

1. **`@supabase/supabase-js` ya está en package.json** — no hay que instalarlo
2. **`.env.example` ya define las vars** — solo falta crear `.env` con valores reales
3. **`constants.ts` es el archivo que hay que reemplazar** — 35KB de datos mock que alimentan todo el frontend
4. **El frontend usa React Router** — 11 rutas funcionales
5. **Supabase tiene las tablas creadas** — schema coincide con los types del frontend (con diferencias menores)

### Supabase Star CRM (prod)

- **URL:** https://wuoptaejdobinsmmkmoq.supabase.co
- **Tablas:** projects (6), agents (1), leads (0), conversations (0), messages (0), appraisals (0), analytics_events (0)
- **Falta:** Huergo 475 en projects

### Producción
- **URL:** https://crm-star2026.vercel.app/
- **Repo:** https://github.com/aidaptivecom-pixel/crm-star2026
- **Deploy:** Auto desde branch `main`

---

## TAREAS PRIORIZADAS

### 🔴 Fase 1: Conectar Frontend ↔ Supabase (sin depender del cliente)

| # | Tarea | Complejidad | Archivo principal |
|---|-------|-------------|-------------------|
| 1 | Crear `src/lib/supabase.ts` con cliente configurado | Simple | lib/supabase.ts |
| 2 | Crear hooks de datos (`useLeads`, `useConversations`, `useProjects`) | Media | hooks/ |
| 3 | Reemplazar imports de `constants.ts` por hooks reales en Dashboard | Media | pages/Dashboard.tsx |
| 4 | Reemplazar datos mock en Inbox | Media | pages/Inbox.tsx |
| 5 | Reemplazar datos mock en Pipeline | Media | pages/Pipeline.tsx |
| 6 | Reemplazar datos mock en Leads | Simple | pages/Leads.tsx |
| 7 | Reemplazar datos mock en Emprendimientos (leer de `projects`) | Simple | pages/Emprendimientos.tsx |
| 8 | Cargar Huergo 475 en Supabase | Simple | DB insert |
| 9 | Seed data: insertar leads y conversaciones de prueba | Simple | DB insert |
| 10 | Configurar .env en Vercel con keys reales | Simple | Vercel config |

### 🟡 Fase 2: Agentes IA (requiere credenciales del cliente)

| # | Tarea | Bloqueante |
|---|-------|------------|
| 11 | Configurar WhatsApp Business API | Credenciales cliente |
| 12 | Implementar workflow n8n Emprendimientos | WhatsApp API |
| 13 | Implementar workflow n8n Inmuebles | WhatsApp API |
| 14 | Implementar workflow n8n Tasaciones | WhatsApp API |
| 15 | Testing con leads reales | Todo lo anterior |

### 🔴 Fase 0: COBRAR (requiere acción de Matias)

| # | Tarea | Quién |
|---|-------|-------|
| 0 | Reunión con Jony: definir precio + obtener credenciales | MATIAS |

---

*Generado por Pulso — 27 Ene 2026*