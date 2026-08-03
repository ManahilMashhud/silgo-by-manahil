pipeline {
    agent any
    
    environment {
        HARBOR_REGISTRY = '192.168.5.232:8085'
        PROJECT_NAME    = 'silgo'
        IMAGE_NAME      = 'silgo-website'
        CREDENTIALS_ID  = 'harbor-creds'
        
        TAG_VERSION     = "${BUILD_NUMBER}"
        TAG_LATEST      = "latest"

        APP_SERVER      = '192.168.5.235'
        APP_USER        = 'devops'
        K8S_NAMESPACE   = 'death'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    app = docker.build("${HARBOR_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}:${BUILD_NUMBER}", "--no-cache .")
                }
            }
        }

        stage('Push to Harbor') {
            steps {
                script {
                    docker.withRegistry("http://${HARBOR_REGISTRY}", "${CREDENTIALS_ID}") {
                        app.push("${BUILD_NUMBER}")
                        app.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    set -e
                    echo "Preparing and updating deployment image tag locally..."
                    
                    REGISTRY_IMAGE="${HARBOR_REGISTRY}/${PROJECT_NAME}/${IMAGE_NAME}"
                    if [ -f deployment.yml ]; then
                        sed -i "s|image:.*|image: ${REGISTRY_IMAGE}:${TAG_VERSION}|g" deployment.yml
                    fi

                    echo "Copying manifest files to Kubernetes server..."
                    
                    ssh -o StrictHostKeyChecking=no "${APP_USER}@${APP_SERVER}" "mkdir -p /tmp/k8s-manifests"
                    scp -o StrictHostKeyChecking=no deployment.yml service.yml "${APP_USER}@${APP_SERVER}:/tmp/k8s-manifests/"

                    echo "Applying manifests on Kubernetes server..."
                    
                    ssh -o StrictHostKeyChecking=no "${APP_USER}@${APP_SERVER}" \
                        "NAMESPACE='${K8S_NAMESPACE}' \
                         bash -s" <<'REMOTE_SCRIPT'

                        set -e
                        cd /tmp/k8s-manifests

                        kubectl apply -f deployment.yml --namespace "$NAMESPACE"
                        kubectl apply -f service.yml --namespace "$NAMESPACE"

                        kubectl rollout status deployment/silgo-deployment --namespace "$NAMESPACE" --timeout=180s

                        echo "Kubernetes deployment completed successfully!"
REMOTE_SCRIPT
                '''
            }
        }
    }
}