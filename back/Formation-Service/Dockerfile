FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the JAR file
COPY target/Formation-Service-*.jar formation-service.jar

# Expose service port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Environment variables for production
ENV SPRING_PROFILES_ACTIVE=docker
ENV JAVA_OPTS="-Xmx1g -Xms512m -XX:+UseG1GC -XX:G1HeapRegionSize=16m"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar formation-service.jar"]
