#!/bin/bash

ENDPOINT_URL=http://localhost:4566

# aws --endpoint-url=$ENDPOINT_URL sns create-topic --name test-topic --no-cli-pager
aws --endpoint-url=$ENDPOINT_URL sqs create-queue --queue-name user-scan --no-cli-pager

aws --endpoint-url=$ENDPOINT_URL sqs create-queue --queue-name user-scan-go --no-cli-pager
