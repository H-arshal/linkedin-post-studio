# syntax=docker/dockerfile:1.7
# Multi-stage Dockerfile for Spring Boot backend
# Final image uses Eclipse Temurin JRE 21 Alpine (~180MB) and runs as non-root.

# ──────────────────────────── Stage 1: Build ────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /build

# Cache dependencies first (faster rebuilds when only code changes)
COPY pom.xml mvnw ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -B -q dependency:go-offline

# Now copy the source and build
COPY src ./src
RUN ./mvnw -B -q clean package -DskipTests

# ──────────────────────────── Stage 2: Run ──────────────────────────────
FROM eclipse-temurin:21-jre-alpine

# Create non-root user for the runtime
RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy the fat-jar from the build stage
# We rename it to app.jar so the start command stays short
COPY --from=builder /build/target/backend-0.0.1-SNAPSHOT.jar app.jar

# Render sets $PORT automatically; default 8080 for local docker run
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080

# Run as non-root
USER app

# Use exec form so signals (SIGTERM) are forwarded properly for graceful shutdown
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
