
# 🚲 Ride Signals Backend

A backend service for real-time ride coordination, built with:

- **Go (Gin + gqlgen GraphQL)**
- **MongoDB** for persistence
- **Kafka** for publishing/consuming ride signals
- **Docker Compose** for local development

---

## 📦 Features

- 🔑 **JWT Authentication** with signup & login
- 👤 User management with unique email indexing
- 🚲 **Rides API**: create/join rides with participants
- 📡 **Signals API**: send real-time ride signals via Kafka
- ⚡ GraphQL endpoint with mutations & queries
- 🗄️ MongoDB collections with proper indexing (`users.email` unique)

---

## 🛠️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/ride-signals.git
cd ride-signals
```

### 2. Run services with Docker Compose

```bash
docker-compose up -d
```

This will start:

- **MongoDB** (`localhost:27017`)
- **Kafka** (with both host and container listeners)
- **Backend API** (`localhost:8080`)

### 3. Kafka networking

- From **host apps (like Go backend)** → use:

  ```
  localhost:9092
  ```

- From **other containers** → use:

  ```
  kafka:9094
  ```

---

## ⚙️ Configuration

Environment variables are managed via `.env`:

```ini
MONGO_URI=mongodb://root:example@localhost:27017/
KAFKA_BROKERS=localhost:9092
JWT_SECRET=supersecretjwt
DB_NAME=rideapp
PORT=8080
```

---

## 🚀 API

### REST Endpoints

- `POST /api/v1/signup` → Register new user
- `POST /api/v1/login` → Login & get JWT

### GraphQL Endpoint

- `POST /api/v1/graphql`
- Playground → `GET /api/v1/playground`

#### Sample Schema

```graphql
type Mutation {
  createRide(maxRiders: Int!, visibility: String!): Ride!
  joinRide(rideCode: String!, role: String!): Ride!
  sendSignal(
    rideCode: String!
    signalType: String!
    lat: Float
    lng: Float
  ): Boolean!
}

type Query {
  me: User!
  ride(rideCode: String!): Ride!
}
```

---

## 🗄️ MongoDB

Collections:

- **users** → stores users (with unique `email`)
- **rides** → ride details & participants
- **signals** → signal history

Indexes:

```go
collection := db.Collection("users")
collection.Indexes().CreateOne(context.TODO(), mongo.IndexModel{
    Keys:    bson.M{"email": 1},
    Options: options.Index().SetUnique(true).SetName("email_unique_index"),
})
```

---

## 📡 Kafka

- Topic: **ride-signals** (auto-created if not exists)
- Producer example:

```go
PublishSignal("rideCode123", []byte(`{"type":"location","lat":12.9,"lng":80.2}`))
```

---

## 🏃 Running Locally

1. Start Docker Compose

   ```bash
   docker-compose up -d
   ```

2. Run the Go server

   ```bash
   go run main.go
   ```

3. Open [http://localhost:8080/api/v1/playground](http://localhost:8080/api/v1/playground) for GraphQL playground.

---

## 🔒 Security Notes

- JWT middleware protects GraphQL routes
- Sensitive fields (`passwordHash`) excluded from schema
- Recommended to **switch to GIN release mode** in production:

  ```go
  gin.SetMode(gin.ReleaseMode)
  ```

---

## 📌 Roadmap

- [ ] Add Kafka consumer service for signals
- [ ] Consumer service to make updates using Sockets.IO
- [ ] Create a frontend using either React(and down-the-line use Cordova to make an app) or React Native
- [ ] Add metrics and monitoring
- [ ] Deploy with Kubernetes

---

## 📜 License

MIT © 2025
