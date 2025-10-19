# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy dependency definitions first for better layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and build
COPY src ./src
RUN mvn clean package -DskipTests -B && \
    # Extract layers for better caching
    java -Djarmode=layertools -jar target/*.jar extract --destination target/extracted

# Stage 2: Runtime (Distroless for minimal attack surface)
FROM gcr.io/distroless/java17-debian12:nonroot

WORKDIR /app

# Copy extracted layers (dependencies change less frequently than app code)
COPY --from=build --chown=nonroot:nonroot /app/target/extracted/dependencies/ ./
COPY --from=build --chown=nonroot:nonroot /app/target/extracted/spring-boot-loader/ ./
COPY --from=build --chown=nonroot:nonroot /app/target/extracted/snapshot-dependencies/ ./
COPY --from=build --chown=nonroot:nonroot /app/target/extracted/application/ ./

# Non-root user (distroless nonroot uid 65532)
USER nonroot

EXPOSE 8443

# Distroless doesn't have shell, use exec form
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "org.springframework.boot.loader.launch.JarLauncher"]
