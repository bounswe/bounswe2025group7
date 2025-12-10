# FIX: Force the container to use x86_64 (amd64) architecture
# This ensures the container file system matches the Android SDK binaries
FROM --platform=linux/amd64 node:20-bookworm

# 1. Install Java (JDK 17) and basic tools
RUN apt-get update && \
    apt-get install -y openjdk-17-jdk unzip curl && \
    rm -rf /var/lib/apt/lists/*

# 2. Setup Android SDK Environment Variables
ENV ANDROID_HOME="/opt/android-sdk"
ENV PATH="${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools"

# 3. Download and Install Android Command Line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools && \
    curl -o commandlinetools.zip https://dl.google.com/android/repository/commandlinetools-linux-10406996_latest.zip && \
    unzip commandlinetools.zip -d ${ANDROID_HOME}/cmdline-tools && \
    mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest && \
    rm commandlinetools.zip

# 4. Accept Licenses and Install Build Tools
# Installing NDK and CMake explicitly to ensure they match the build requirements
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-36" "build-tools;36.0.0" "ndk;27.1.12297006" "cmake;3.22.1"

# 5. Set Working Directory
WORKDIR /app

# 6. Install Dependencies
COPY package*.json ./
RUN npm install

# 7. Copy the rest of the project
COPY . .

# 8. Generate local.properties for the container environment
RUN echo "sdk.dir=${ANDROID_HOME}" > android/local.properties

# 9. Build the APK
WORKDIR /app/android
RUN chmod +x ./gradlew
RUN ./gradlew assembleRelease