FROM golang:1.27-alpine AS builder

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/histodle-api ./cmd/api

FROM alpine:3.22

RUN adduser -D -H -u 10001 appuser
WORKDIR /app
COPY --from=builder /out/histodle-api /app/histodle-api
USER appuser
EXPOSE 8080
ENTRYPOINT ["/app/histodle-api"]
