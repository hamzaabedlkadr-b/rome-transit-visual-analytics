#!/bin/zsh
cd "${0:A:h}"
if /usr/bin/curl -fsS 'http://localhost:8765/web/data/rome_transport.json' -o /dev/null 2>/dev/null; then
  /usr/bin/open 'http://localhost:8765/web/'
  exit 0
fi
/usr/bin/python3 -m http.server 8765 &
server_pid=$!
trap 'kill $server_pid 2>/dev/null' EXIT INT TERM
for attempt in {1..30}; do
  if /usr/bin/curl -fsS 'http://localhost:8765/web/data/rome_transport.json' -o /dev/null 2>/dev/null; then
    /usr/bin/open 'http://localhost:8765/web/'
    wait $server_pid
    exit $?
  fi
  sleep 0.2
done
echo 'Could not start the dashboard server on port 8765.' >&2
exit 1
