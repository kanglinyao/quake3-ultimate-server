# Use an official Ubuntu as a parent image
FROM ubuntu:20.04

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV RCON_PASSWORD="defaultpassword"
ENV Q3_VERSION="1.32"
ENV OSP_VERSION="0.99t"
ENV CPMA_VERSION="1.52"

# Install necessary packages
RUN apt-get update && \
    apt-get install -y wget unzip lib32gcc1 nodejs npm curl

# Install LinuxGSM
RUN mkdir -p /lgsm && \
    cd /lgsm && \
    curl -o linuxgsm.sh https://linuxgsm.sh && \
    chmod +x linuxgsm.sh && \
    ./linuxgsm.sh q3server

# Set up directories for Quake 3
RUN mkdir -p /quake3/baseq3 /quake3/osp /quake3/cpma /quake3/missionpack

# Download and install Quake 3 using LinuxGSM
RUN cd /lgsm && \
    ./q3server auto-install

# Copy Quake 3 base game files and mission pack maps
COPY quake3_files/baseq3/pak0.pk3 /quake3/baseq3/pak0.pk3
COPY quake3_files/missionpack/*.pk3 /quake3/missionpack/

# Download and install OSP mod
RUN wget -q https://www.fileplanet.com/archive/p-14602/Quake-III-Arena-OSP-Mod-v0-99t/download -O /tmp/osp.zip && \
    unzip /tmp/osp.zip -d /quake3/osp && \
    rm /tmp/osp.zip

# Download and install CPMA mod
RUN wget -q https://files.quakecdn.com/cpma/cpma-1.52-nomaps.zip -O /tmp/cpma.zip && \
    unzip /tmp/cpma.zip -d /quake3/cpma && \
    rm /tmp/cpma.zip

# Copy server configuration files
COPY configs/osp-server.cfg /quake3/baseq3/osp-server.cfg
COPY configs/cpma-server.cfg /quake3/baseq3/cpma-server.cfg

# Set the working directory for the backend
WORKDIR /app

# Copy backend package.json and install dependencies
COPY backend/package.json /app/backend/package.json
RUN cd /app/backend && npm install

# Copy backend server files
COPY backend /app/backend

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy frontend files
COPY frontend /app/frontend

# Install a simple HTTP server to serve static frontend files
RUN npm install -g http-server

# Expose the ports for the backend, frontend, and game servers
EXPOSE 3000 8080 27960/udp 27961/udp

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Start both the backend and frontend servers along with Quake 3 servers
ENTRYPOINT ["/entrypoint.sh"]