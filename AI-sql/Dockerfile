FROM golang:1.21-alpine

WORKDIR /app

COPY go.mod go.sum ./backend/
COPY backend/ ./backend/

WORKDIR /app/backend
RUN go mod download

RUN GOOS=linux GOARCH=arm64 go build -o /app/server cmd/server/main.go

WORKDIR /app
COPY frontend/build/ ./frontend/build/

EXPOSE 8080

CMD ["./server"]
