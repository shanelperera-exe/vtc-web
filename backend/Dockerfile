# Multi-stage Dockerfile for Spring Boot (Java 17)
# Builder stage: compile with Maven and cache dependencies
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /app

# Leverage dependency caching
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN mvn -B -q -DskipTests dependency:go-offline

# Copy sources and build
COPY src ./src
RUN mvn -B -DskipTests package

# Runtime stage: slim JRE image, non-root user
FROM eclipse-temurin:17-jre-alpine

# Create app directory and non-root user
WORKDIR /app
RUN addgroup -S spring && adduser -S spring -G spring

# Copy fat jar from builder
COPY --from=builder /app/target/*.jar /app/app.jar
RUN chown -R spring:spring /app

USER spring
EXPOSE 8080

# Common runtime envs (can be overridden at run time)
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""

# Optional: if you enable Actuator in your app, you can add a HEALTHCHECK in Compose
# HEALTHCHECK CMD wget --spider -q http://localhost:8080/actuator/health || exit 1

# Run the application
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar /app/app.jar"]