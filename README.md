# DataPlant 🌱

AI-платформа для раннего выявления болезней растений в Кыргызстане: диагностика
по фото, карта здоровья поля, прогноз болезней и рекомендации. Мобильный-first
веб-MVP с поддержкой офлайн-режима и трёх языков (русский / кыргызский / английский).

## Архитектура

Монорепо из двух частей:

| Папка | Стек | Назначение |
| --- | --- | --- |
| `frontend/` | Next.js 16 (App Router, TS) + Tailwind v4 + next-intl | UI, 9 экранов, i18n, офлайн-режим, freemium |
| `backend/` | FastAPI (Python) + OpenRouter + OpenWeatherMap | `/api/analyze-leaf` — AI-диагностика; `/api/weather`, `/api/forecast`, `/api/disease-risk` — реальная погода и риск болезней |

Фронтенд проксирует `/api/*` на FastAPI через `rewrites` в `next.config.ts`
(базовый URL задаётся переменной `BACKEND_URL`).

## Экраны

Онбординг · Главная (Dashboard) · Карта здоровья поля · AI-диагностика (Scan) ·
Прогноз болезней (Premium) · Рекомендации · Журнал/История (Premium) ·
Уведомления · Профиль и дроны.

Ключевые культуры КР: **яблоня, абрикос, виноград, картофель, овощи** — с
региональными болезнями (парша, монилиоз, милдью, фитофтороз, альтернариоз).

## Быстрый старт

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate           # Windows (Linux/Mac: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env           # затем заполните ключи (см. ниже)
uvicorn main:app --reload --port 8000
```

Проверка: `http://localhost:8000/api/health` → `{"status":"ok", "aiConfigured":true, ...}`.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
copy .env.example .env.local     # при необходимости поменяйте BACKEND_URL
npm run dev
```

Откройте `http://localhost:3000`.

## Конфигурация (.env)

### `backend/.env`

| Переменная | Откуда взять | Обязательность |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | [openrouter.ai/keys](https://openrouter.ai/keys) | Нужен для живой AI-диагностики; без него анализ недоступен |
| `OPENROUTER_MODEL` | Любая vision-модель: `google/gemini-2.5-flash` (по умолч.), `anthropic/claude-opus-4-8`, `openai/gpt-4o` | Опциональна |
| `OWM_API_KEY` | [openweathermap.org/api](https://openweathermap.org/api) — бесплатный тариф | Нужен для реальной погоды; без него погода недоступна |
| `FIELD_LAT` / `FIELD_LON` | Координаты вашего поля | Опциональны (по умолч. Бишкек) |
| `FRONTEND_ORIGIN` | URL фронтенда | Опциональна |

### `frontend/.env.local`

```
BACKEND_URL=http://127.0.0.1:8000
```

## API эндпоинты

| Метод | Путь | Описание |
| --- | --- | --- |
| `GET` | `/api/health` | Статус сервиса, флаги aiConfigured / weatherConfigured |
| `POST` | `/api/analyze-leaf` | AI-диагностика болезни по фото (OpenRouter) |
| `GET` | `/api/weather` | Текущая погода (OWM или мок) |
| `GET` | `/api/forecast` | 5-дневный прогноз + риск болезней по агрономическим правилам |
| `GET` | `/api/disease-risk` | Текущий риск по каждой культуре (яблоня / абрикос / виноград / картофель / овощи) |

## Возможности

- **Живая AI-диагностика по фото** — камера / загрузка → FastAPI → OpenRouter (любая vision-модель). Без ключа сервис возвращает ошибку.
- **Реальная погода** — OpenWeatherMap для Кыргызстана. При недоступности API дашборд показывает пустое состояние вместо моков.
- **Прогноз риска болезней** — 5-дневный прогноз OWM + агрономические пороговые правила для каждой культуры (без ML, полностью детерминировано).
- **Офлайн-режим** — встроенная локальная «модель» даёт предварительный диагноз без сети; при возврате в онлайн уточняется в облаке.
- **Freemium** — лимит бесплатных облачных сканов в день; экраны Прогноз / История закрыты для бесплатного тарифа (переключение тарифа — в Профиле).
- **i18n (ru / ky / en)** — переключатель в онбординге и профиле; язык хранится в cookie.

## Скрипты

| Команда | Где | Действие |
| --- | --- | --- |
| `npm run dev` | frontend | Дев-сервер |
| `npm run build` | frontend | Прод-сборка + проверка типов |
| `npm run lint` | frontend | ESLint |
| `uvicorn main:app --reload` | backend | Дев-сервер API |
