FROM openjdk:21-jdk-slim

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY mvnw.cmd .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Copy source code
COPY src src

# Build the application
RUN ./mvnw -DskipTests clean package

# Expose port
EXPOSE $PORT

# Run the application
CMD ["java", "-Dserver.port=${PORT}", "-jar", "target/smart-consulting-1.0.0.jar"]
