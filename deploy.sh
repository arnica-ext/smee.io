#!/bin/bash

# load env vars from env.sh, exit if not found

if [ -f env.sh ]; then
    source env.sh
else
    echo "env.sh not found. Please create it and include the following vars in it: IMAGE_NAME, TAG, ECS_CLUSTER_NAME, ECS_SERVICE_NAME"
    exit 1
fi

if [ -z "${IMAGE_NAME}" ]; then
    echo "IMAGE_NAME not found in env.sh"
    exit 1
fi

if [ -z "${TAG}" ]; then
    echo "TAG not found in env.sh"
    exit 1
fi

if [ -z "${ECS_CLUSTER_NAME}" ]; then
    echo "ECS_CLUSTER_NAME not found in env.sh"
    exit 1
fi

if [ -z "${ECS_SERVICE_NAME}" ]; then
    echo "ECS_SERVICE_NAME not found in env.sh"
    exit 1
fi



# Retrieve the AWS account ID and region from the AWS CLI
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
AWS_REGION=$(aws configure get region)

# Log in to Amazon ECR
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Build the Docker image
docker build -t "${IMAGE_NAME}" .

# Tag the Docker image with the ECR registry URL
docker tag "${IMAGE_NAME}:${TAG}" "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${TAG}"

# Push the Docker image to the ECR registry
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${IMAGE_NAME}:${TAG}"

aws ecs update-service --cluster "${ECS_CLUSTER_NAME}" --service "${ECS_SERVICE_NAME}" --force-new-deployment --region "${AWS_REGION}" --output text --query 'service.taskDefinition'
