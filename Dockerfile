# syntax=docker/dockerfile:1

# Runtime image: Alpine Linux + OpenJDK 25
FROM eclipse-temurin:25-jre-alpine

WORKDIR /app
EXPOSE 8080

# JAR is built by Maven during the Jenkins pipeline,
# VERSION is passed via --build-arg.
ARG VERSION=0.0.1-SNAPSHOT
COPY target/laundry-app-${VERSION}.jar /app/app.jar

# H2 database and uploaded photos live under /app/data.
# Map a volume here (e.g. -v /path/to/data:/app/data) to persist them.
RUN mkdir -p /app/data

ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]