#!/bin/bash

echo "Start setup ArangoDB"


docker pull arangodb/arangodb:latest
docker run -d -e ARANGO_ROOT_PASSWORD="root" -p 8529:8529 arangodb/arangodb-preview:nightly.devel

sleep 2

n=0
# timeout value for startup
timeout=60
while [[ (-z `curl -H 'Authorization: Basic cm9vdDpyb290' -s 'http://127.0.0.1:8529/_api/version' `) && (n -lt timeout) ]] ; do
  echo -n "."
  sleep 1s
  n=$[$n+1]
done

if [[ n -eq timeout ]];
then
    echo "Could not start ArangoDB. Timeout reached."
    exit 1
fi

echo "ArangoDB is up"

node ./tests/setupLogDB
