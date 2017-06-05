#!/usr/bin/env bash
# given /app/index.js exists
exec node /app/index.js 2>>/logs/stderr.log >>/logs/stdout.log
