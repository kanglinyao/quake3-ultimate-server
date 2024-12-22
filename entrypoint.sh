#!/bin/bash

# Start OSP server
/quake3/quake3.x86 +set dedicated 2 +set net_port 27960 +set fs_game osp +set rconpassword $RCON_PASSWORD +exec osp-server.cfg &

# Start CPMA server
/quake3/quake3.x86 +set dedicated 2 +set net_port 27961 +set fs_game cpma +set rconpassword $RCON_PASSWORD +exec cpma-server.cfg &

# Start backend server
cd /app/backend && npm start &

# Start frontend server
http-server /app/frontend -p 8080