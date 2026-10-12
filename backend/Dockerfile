# --- STAGE 1: Build JAR ---
FROM eclipse-temurin:21-jdk-jammy AS builder
WORKDIR /workspace

# Copy Gradle wrapper và cấu hình dependencies để tận dụng Docker cache
COPY gradlew .
COPY gradle/ gradle/
COPY build.gradle.kts .
COPY settings.gradle.kts .

RUN chmod +x gradlew && ./gradlew dependencies --no-daemon || true

# Copy toàn bộ mã nguồn
COPY src/ src/

# Build JAR
RUN ./gradlew bootJar --no-daemon -x test

# --- STAGE 2: Runtime ---
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Tạo non-root user đảm bảo bảo mật
RUN groupadd -r spring && useradd -r -g spring spring
USER spring:spring

COPY --from=builder /workspace/build/libs/*.jar /app/app.jar

ENV SERVER_PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
