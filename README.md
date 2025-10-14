# 🚲 Ride Signals

A **real-time ride coordination platform** enabling users to create, join, and share rides — powered by a scalable backend built with **Go**, **Socket.IO**, **Dragonfly**, and **MongoDB**, and a modern frontend using **Next.js (React)**.

---

## 🧠 Overview

Ride Signals is designed for **live location updates**, **real-time ride tracking**, and **instant user coordination**.

Built for performance and scalability — the backend leverages **Dragonfly** for ultra-fast pub/sub communication and caching, and **Socket.IO** for persistent WebSocket connections with clients.

---

## ⚙️ Tech Stack

### 🧩 Backend

* **Go (Gin)** — REST + GraphQL API
* **GraphQL (gqlgen)** — Flexible data querying
* **MongoDB** — Persistent storage for users, rides, and signals
* **Dragonfly DB** — Redis-compatible in-memory store for:

  * Socket presence and state tracking
  * Pub/Sub ride updates
  * Session caching
* **Socket.IO (Go + Node)** — Real-time ride signaling and coordination
* **JWT Authentication** — Secure access to protected APIs

### 🌐 Frontend

* **React + Next.js** — Interactive client app with SSR
* **Zustand** — Global state management
* **Socket.IO Client** — Real-time updates in the browser
* **TypeScript + Tailwind CSS** — Scalable and clean UI

### ☁️ Infrastructure

* **AWS EC2 / ECS** — Hosting backend and socket services
* **Docker & Docker Compose** — Local development and containerized deployments
* **NGINX** — Reverse proxy and static asset serving

---

## 🚀 Features

* 🔐 **JWT Authentication** — Secure login & signup
* 🧍 **User Management** — Unique email-based accounts
* 🚴 **Rides API** — Create, join, and manage rides
* 🛰️ **Real-time Ride Updates** — Via Socket.IO + Dragonfly pub/sub
* 🗺️ **Live Location Sharing** — Seamless location broadcasting
* 💬 **Signal Broadcasting** — Real-time communication between ride participants
* 🧩 **GraphQL + REST APIs** — For flexible client integration
* 🧾 **MongoDB Indexing** — Optimized for user and ride lookups

---

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ride-signals.git
cd ride-signals
```

### 2. Create Environment File

```ini
MONGO_URI=
KAFKA_BROKERS=localhost
JWT_SECRET=
REFRESH_SECRET=
SERVER_PORT=8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_MAP_ID=
NEXT_PUBLIC_API_URL=https://localhost:8000/api/v1
GOOGLE_REDIRECT_URL=https://localhost:8000/api/v1/auth/google/callback
FRONTEND_URL=https://localhost:3000
REDIS_HOST=dragonfly
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
MY_EMAIL=
```

### 3. Start Services with Docker Compose

```bash
docker-compose up -d
```

This will spin up:

* 🧩 **MongoDB** → persistent data
* ⚡ **Dragonfly DB** → caching and pub/sub
* 🧠 **Go Backend (Gin + GraphQL)**
* 🔌 **Socket.IO Server (Bun/Node)**

---


## 🧰 Development

### Start Backend Locally

```bash
go run main.go
```

### Start Socket Server

```bash
bun index.js
```

### Start Frontend

```bash
bun dev
```

Open: [http://localhost:3000](http://localhost:3000)

Although I recommend using a reverse-proxy like NGINX to make life easier for yourself.

---

## 🔒 Security Notes

* All protected routes require JWT bearer tokens
* Sensitive user data (e.g., passwords) are excluded from GraphQL schema
* Recommended to use **HTTPS** + **secure cookies** in production

---

## 🌍 Deployment (AWS)

Typical setup:

* **AWS ECS / Fargate**: Socket.IO + Dragonfly + Go backend + Frontend
* **AWS DocumentDB**: Mongo-compatible database
* **Route 53 + NGINX / AWS ACM + AWS ALB**: Domain routing and load balancing

---

## 📜 License

MIT © 2025
