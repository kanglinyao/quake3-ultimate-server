# Quake 3 Server Control

This project sets up a Dockerized Quake 3 server with CPMA and OSP mods, along with a web application to control the servers. The web application allows users to manage the servers, bots, map lists, and map rotations. The setup includes both backend and frontend components, with user authentication for secure access.

## Features

- **Quake 3 Server**: Installs and runs Quake 3 servers with CPMA and OSP mods.
- **Web Application**: Provides a user-friendly interface to control the servers.
- **User Authentication**: Ensures only authorized users can manage the servers.
- **Map Management**: Allows users to view and set map rotations.
- **Bot Management**: Provides controls to add and remove bots.

## Prerequisites

- Docker
- Quake 3 base game files (`pak0.pk3`) and mission pack maps

## Directory Structure

/project-directory
├── backend
│ ├── server.js
│ ├── package.json
├── frontend
│ ├── index.html
├── configs
│ ├── osp-server.cfg
│ ├── cpma-server.cfg
├── quake3_files
│ ├── baseq3
│ │ ├── pak0.pk3
│ ├── missionpack
│ │ ├── map1.pk3
│ │ ├── map2.pk3
├── Dockerfile
├── entrypoint.sh