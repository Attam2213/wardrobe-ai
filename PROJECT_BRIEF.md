# Wardrobe AI — Проект приложение для виртуальной примерки одежды

## 🎯 Общее описание

Это мобильное приложение (iOS + Android) для управления гардеробом, виртуальной примерки одежды с 3D аватаром и умным AI-стилистом, который подбирает образы на основе погоды и личных предпочтений.

**Основная идея:** 
1. Пользователь фотографирует свою одежду дома
2. Загружает в приложение (AI автоматически определяет тип и цвет)
3. Создаёт 3D модель своего тела через 2 фото (спереди и сзади)
4. Виртуально примеряет комбинации на аватар
5. AI-стилист каждое утро подбирает образ исходя из погоды, температуры и повода

---

## 📋 Функциональность приложения

### MVP (2 месяца)
- ✅ Авторизация (Google, Apple, Email)
- ✅ Добавление вещей в гардероб
- ✅ Категоризация и теги (рубашка, джинсы, куртка, обувь и т.д.)
- ✅ Хранение фото вещей
- ✅ Геолокация и интеграция с OpenWeatherMap
- ✅ AI-подбор образа на основе погоды через Claude API
- ✅ История образов (календарь)

### Дополнительно (3-4 месяца)
- ✅ Сканирование тела через 2 фото (Bodygram API)
- ✅ 3D аватар (Ready Player Me SDK)
- ✅ Виртуальная примерка одежды на аватар (drag & drop)
- ✅ Ротация и просмотр 360°
- ✅ Распознавание одежды по фото (Vision API)
- ✅ Планирование образов на неделю
- ✅ Пуш-уведомления по утрам
- ✅ История того что ты носил

---

## 🏗️ Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                   React Native приложение                   │
│                (iOS + Android через Expo)                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS запросы
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       VDS Ubuntu                            │
│                      8 GB RAM                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Nginx (SSL via Let's Encrypt)                       │   │
│  │  Порт: 80, 443                                       │   │
│  └─────────────────────┬────────────────────────────────┘   │
│                        │                                     │
│  ┌─────────────────────▼────────────────────────────────┐   │
│  │  Node.js + Express API (Docker)                      │   │
│  │  - Авторизация (JWT)                                │   │
│  │  - CRUD для гардероба                               │   │
│  │  - Интеграция с Claude API                          │   │
│  │  - Интеграция с Bodygram API                        │   │
│  │  - Интеграция с OpenWeatherMap                      │   │
│  │  Порт: 3000 (внутренний)                            │   │
│  └─────┬──────────┬──────────┬──────────────────────────┘   │
│        │          │          │                               │
│  ┌─────▼──┐ ┌─────▼──┐ ┌────▼──────┐ ┌─────────────────┐   │
│  │  PG    │ │ Redis  │ │  MinIO    │ │ Cloudinary API  │   │
│  │        │ │        │ │  (S3)     │ │ (опционально)   │   │
│  └────────┘ └────────┘ └───────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────┘

Внешние сервисы:
- Google OAuth 2.0
- Apple Sign-In
- Claude API (стилист)
- OpenWeatherMap API (погода)
- Bodygram API (3D из фото)
- Ready Player Me SDK (аватар)
- Expo Push (уведомления)
```

---

## 🛠️ Стек технологий

### Backend
- **Runtime:** Node.js 20 LTS
- **Фреймворк:** Express.js (TypeScript)
- **БД:** PostgreSQL (в Docker)
- **Кэш:** Redis (в Docker)
- **Файлы:** MinIO (в Docker, как S3-compatible)
- **ОРМ:** Prisma
- **Авторизация:** JWT (самодельная) + Google OAuth + Apple Sign-In
- **Валидация:** Zod или Joi
- **Тестирование:** Jest

### Frontend (Мобиль)
- **Framework:** React Native (Expo)
- **Язык:** TypeScript
- **Навигация:** React Navigation
- **State Management:** Zustand или Redux
- **UI Components:** React Native Paper или Tamagui
- **API запросы:** Axios или Fetch
- **Камера:** Expo Camera
- **Хранилище:** Expo SecureStore (токены)
- **Геолокация:** Expo Location
- **3D:** Three.js / Babylon.js (для рендера аватара)
- **Тестирование:** Jest + Detox (E2E)

### DevOps
- **Контейнеризация:** Docker + Docker Compose
- **Веб-сервер:** Nginx
- **SSL:** Let's Encrypt (certbot)
- **Мониторинг:** Sentry (ошибки), Grafana (сервер)
- **CI/CD:** GitHub Actions (опционально)

---

## 📊 Схема БД

```sql
-- Пользователи
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  password_hash VARCHAR,
  username VARCHAR,
  created_at TIMESTAMP,
  avatar_url VARCHAR,
  geo_latitude FLOAT,
  geo_longitude FLOAT
)

-- Вещи в гардеробе
wardrobe_items (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  name VARCHAR,
  type VARCHAR (shirt, pants, jacket, shoes, accessories),
  color VARCHAR,
  material VARCHAR,
  size VARCHAR,
  photo_url VARCHAR,
  purchase_date DATE,
  created_at TIMESTAMP
)

-- Сохранённые образы
outfits (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  name VARCHAR,
  items JSON (array of wardrobe_item_ids),
  worn_date DATE,
  weather_condition VARCHAR,
  occasion VARCHAR,
  ai_generated BOOLEAN,
  created_at TIMESTAMP
)

-- Аватары пользователей
avatars (
  id UUID PRIMARY KEY,
  user_id UUID FOREIGN KEY,
  model_url VARCHAR (link to .glb file in MinIO),
  bodygram_id VARCHAR,
  created_at TIMESTAMP
)
```

---

## 🔄 Основные API эндпоинты

```
[POST]   /api/auth/register          — регистрация по email
[POST]   /api/auth/login             — вход по email
[POST]   /api/auth/google            — OAuth google callback
[POST]   /api/auth/apple             — Sign-In apple callback
[POST]   /api/auth/refresh           — обновить JWT токен
[GET]    /api/user/profile           — мой профиль
[PUT]    /api/user/profile           — обновить профиль

[GET]    /api/wardrobe              — все мои вещи
[POST]   /api/wardrobe              — добавить вещь
[PUT]    /api/wardrobe/:id          — изменить вещь
[DELETE] /api/wardrobe/:id          — удалить вещь
[POST]   /api/wardrobe/upload       — загрузить фото вещи

[GET]    /api/outfits               — все мои образы
[POST]   /api/outfits               — сохранить образ
[DELETE] /api/outfits/:id           — удалить образ
[POST]   /api/outfits/ai-suggest    — AI подобрать образ
  body: { temperature, condition, occasion }
  response: { items: [wardrobe_items], explanation: string }

[POST]   /api/avatar/scan           — загрузить 2 фото для сканирования
[GET]    /api/avatar/:id            — получить 3D модель аватара
[POST]   /api/avatar/upload-glb     — загрузить готовый .glb файл

[POST]   /api/ai/recognize-clothes  — AI определить тип одежды по фото
  body: { image_base64 }
  response: { type, color, material, style }

[GET]    /api/weather               — текущая погода по координатам
  query: { lat, lng }
  response: { temperature, condition, forecast }
```

---

## 🚀 План реализации (6 месяцев)

### **ЭТАП 1: Фундамент (Недели 1–3)**
- [ ] Настройка VDS (Docker, Nginx, SSL)
- [ ] PostgreSQL + Prisma схема
- [ ] Redis в Docker
- [ ] MinIO в Docker
- [ ] Node.js API сервер базовая структура
- [ ] JWT авторизация
- [ ] Google OAuth интеграция
- [ ] Apple Sign-In интеграция

### **ЭТАП 2: Мобильное приложение (Недели 2–5)**
- [ ] React Native + Expo проект
- [ ] Экраны авторизации
- [ ] Хранение токена в SecureStore
- [ ] Экран гардероба (список вещей)
- [ ] Добавление вещи (камера, форма, загрузка)
- [ ] Интеграция с OpenWeatherMap
- [ ] Экран AI-стилиста
- [ ] Интеграция с Claude API

### **ЭТАП 3: 3D Аватар (Недели 5–10)**
- [ ] Экран сканирования (2 фото)
- [ ] Интеграция Bodygram API
- [ ] Ready Player Me SDK
- [ ] Three.js для рендера
- [ ] Drag & drop вещей на аватар
- [ ] Вращение 360°

### **ЭТАП 4: AI-функции (Недели 9–14)**
- [ ] Распознавание одежды (Vision API)
- [ ] История образов (календарь)
- [ ] Планирование на неделю
- [ ] Пуш-уведомления (Expo)
- [ ] Улучшение промптов для Claude

### **ЭТАП 5: Полировка (Недели 14–24)**
- [ ] Unit + E2E тесты
- [ ] Безопасность и GDPR
- [ ] Бета-тест с пользователями
- [ ] Публикация App Store + Google Play
- [ ] Мониторинг (Sentry, Grafana)
- [ ] Документация и поддержка

---

## 🎯 Требования к тебе как к ИИ агенту

Когда я спрашиваю тебя, ты должен:

1. **Помнить контекст** — это приложение с мобилкой и бэкендом, не путай с другими проектами
2. **Писать реальный код** — который можно копировать и запускать
3. **Давать пошаговые инструкции** — особенно для сложных частей (Docker, OAuth, 3D)
4. **Предлагать файлы** — если нужен конфиг или скрипт, предложи создать файл
5. **Указывать версии пакетов** — чтобы избежать несовместимостей
6. **Выделять важное** — что может сломаться, на что обратить внимание
7. **Писать на русском** — я предпочитаю русский язык

## 🔐 Важные детали

- **VDS сервер:** Ubuntu, 8GB RAM, чистый, мой (не Firebase, не Vercel)
- **Авторизация:** JWT токены + Google + Apple, хранение на телефоне в SecureStore
- **Фото:** Загружаются в MinIO (на сервере), не в облако
- **API ключи:** OpenWeatherMap, Claude, Google OAuth, Apple — нужны будут
- **Тестирование:** На реальных девайсах iOS и Android перед публикацией

---

## 💡 Примеры того что может спросить пользователь

- "Напиши docker-compose.yml для этого проекта"
- "Как подключить Google Sign-In в React Native?"
- "Напиши схему БД в Prisma"
- "Как загружать файлы в MinIO?"
- "Напиши промпт для Claude стилиста"
- "Как интегрировать Bodygram API?"
- "Структура папок React Native проекта"
- "Как делать пуш-уведомления через Expo?"
- "Как опубликовать в App Store и Google Play?"

---

## ✅ Что в итоге получается

Приложение которое:
1. Позволяет загружать и управлять своим гардеробом
2. Создаёт 3D модель тела пользователя
3. Позволяет виртуально примерять одежду
4. Каждое утро предлагает образ исходя из погоды
5. Хранит историю образов и рекомендаций
6. Работает на iOS и Android

**MVP (первые 2 месяца):** гардероб + AI-подбор по погоде
**Полная версия:** + 3D аватар, примерка, распознавание одежды, уведомления
