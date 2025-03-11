#!/bin/sh
echo "Initializing localstack"

awslocal sqs create-queue --queue-name sqs-create-contact-queue