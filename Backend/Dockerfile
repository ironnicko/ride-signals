# Start from lightweight Go image
FROM golang:1.25.1-alpine

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build
RUN go build -o backend ./

# Run
CMD ["./backend"]
