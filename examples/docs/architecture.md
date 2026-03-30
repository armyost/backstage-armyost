# Architecture

This service is part of the `examples` system in Armyost.

## Components

- `micro-service-a` (provider of `example-grpc-api`)
- `micro-service-b` (consumer of `example-grpc-api`)

## Data flow

1. `micro-service-a` exposes API via gRPC.
2. `micro-service-b` consumes API to perform user registration.
3. Feature relationships:
   - `user-authentication` (feature of micro-service-a)
   - `user-registration` (feature of micro-service-b)
