pipeline {
    agent any

    parameters {
        string(name: 'GIT_BRANCH', defaultValue: 'main', description: 'Which branch to build?')
    }

    environment {
        DOCKER_IMAGE   = "danielrivni/coupix"
        K8S_DEPLOYMENT = "coupix"
        K8S_NAMESPACE  = "default"
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    git branch: "${params.GIT_BRANCH}", url: 'https://github.com/DanielRivni/Coupix.git'
                }
            }
        }

        stage('Determine Version') {
            steps {
                script {
                    if (params.GIT_BRANCH != 'main') {
                        def shortCommit = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                        env.IMAGE_TAG = "0.0.0-${shortCommit}"
                    } else {
                        def lastTag = sh(script: "git describe --tags --abbrev=0", returnStdout: true).trim()
                        env.IMAGE_TAG = "${lastTag}"
                    }

                    echo "Using image tag: ${env.IMAGE_TAG}"
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir ('app'){
                    script {
                        sh "docker build -t ${env.DOCKER_IMAGE}:${env.IMAGE_TAG} ."
                    }
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withDockerRegistry(credentialsId: 'docker-hub-credentials', url: 'https://index.docker.io/v1/') {
                    sh "docker push ${env.DOCKER_IMAGE}:${env.IMAGE_TAG}"
                }
            }
        }

        stage('Render Jinja2 Template') {
            steps {
                dir('deployment'){
                    script {
                        sh """
                        python3 -m venv /opt/venv
                        . /opt/venv/bin/activate
                        pip3 install jinja2-cli

                        jinja2 deployment.yaml.j2 --format=yaml \\
                            -D docker_image=${env.DOCKER_IMAGE} \\
                            -D image_tag=${env.IMAGE_TAG} > generated-deployment.yaml
                        """
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                dir('deployment'){
                    script {
                        sh "kubectl -n ${env.K8S_NAMESPACE} apply -f generated-deployment.yaml -f service.yaml --wait=true"
                    }
                }
            }
        }
    }    
}

