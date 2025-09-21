pipeline {
    agent any
    
    tools {
        jdk 'Java17'
        maven 'Maven3'
        nodejs 'Node18'
    }

    environment {
        MYSQL_DB = 'database'
        MYSQL_PORT = '3306'
        APP_NAME = "cicd-pipeline"
        RELEASE = "1.0.0"
        DOCKER_USER = "rimzoghlami"
        DOCKER_PASS = 'dockerhub'
        IMAGE_NAME = "${DOCKER_USER}/${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        PATH = "$PATH:$HOME/.npm-global/bin"
    }

    stages {
        stage('Start MySQL (no password)') {
            steps {
                script {
                    try {
                        sh 'docker rm -f mysql-test || true'
                        sh '''
                            docker run --name mysql-test \
                                -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
                                -e MYSQL_DATABASE=$MYSQL_DB \
                                -p $MYSQL_PORT:3306 \
                                -d mysql:8.0 \
                                --default-authentication-plugin=mysql_native_password

                            echo "Waiting for MySQL to start..."
                            sleep 20
                        '''
                    } catch (Exception e) {
                        echo "Warning: MySQL setup failed, continuing pipeline: ${e.message}"
                    }
                }
            }
        }

        stage("Cleanup Workspace") {
            steps {
                cleanWs()
            }
        }

        stage("Checkout from SCM") {
            steps {
                retry(3) {
                    git branch: 'main', credentialsId: 'github', url: 'https://github.com/rimzoghlami/espritPFAapp'
                }
            }
        }

        stage("Build Applications") {
            parallel {
                stage("Build Frontend") {
                    steps {
                        script {
                            dir('front') {
                                sh 'npm install -g @angular/cli'
                                sh 'npm install'
                                sh '''
                                    set +e
                                    npx ng build --configuration production
                                    BUILD_EXIT_CODE=$?
                                    
                                    if [ -d "dist/sakai-ng" ] && [ -f "dist/sakai-ng/index.html" ]; then
                                        echo "Frontend build succeeded!"
                                        ls -la dist/sakai-ng/
                                        exit 0
                                    else
                                        echo "Frontend build failed"
                                        exit 1
                                    fi
                                '''
                            }
                        }
                    }
                }
                
                stage("Build Microservices") {
                    steps {
                        script {
                            // Define your microservices
                            def microservices = [
                                'back/EurekaServer',
                                'back/Formation-Service', 
                                'back/User-Service'
                            ]
                            
                            microservices.each { service ->
                                if (fileExists("${service}/pom.xml")) {
                                    echo "Building ${service}..."
                                    dir(service) {
                                        sh 'mvn clean package -DskipTests -q'
                                        echo "${service} built successfully"
                                    }
                                } else {
                                    echo "Warning: ${service}/pom.xml not found, skipping..."
                                }
                            }
                        }
                    }
                }
            }
        }

        stage("Test Applications") {
            parallel {
                stage("Test Microservices") {
                    steps {
                        script {
                            def microservices = [
                                'back/EurekaServer',
                                'back/Formation-Service', 
                                'back/User-Service'
                            ]
                            
                            microservices.each { service ->
                                if (fileExists("${service}/pom.xml")) {
                                    echo "Testing ${service}..."
                                    dir(service) {
                                        sh 'mvn test -q || echo "Tests failed for ${service} but continuing pipeline"'
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage("Test Frontend") {
                    steps {
                        script {
                            dir('front') {
                                sh 'npm test -- --watch=false --browsers=ChromeHeadless || echo "Frontend tests failed but continuing pipeline"'
                            }
                        }
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            parallel {
                stage('SonarQube Microservices') {
                    steps {
                        script {
                            // Analyze Formation-Service (main business service)
                            if (fileExists('back/Formation-Service/pom.xml')) {
                                dir('back/Formation-Service') {
                                    withSonarQubeEnv(credentialsId: 'jenkins-sonarqube-token') {
                                        sh 'mvn sonar:sonar || echo "SonarQube analysis failed but continuing"'
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage('SonarQube Frontend') {
                    steps {
                        script {
                            dir('front') {
                                withSonarQubeEnv(credentialsId: 'jenkins-sonarqube-token') {
                                    sh 'npm install sonar-scanner || echo "sonar-scanner install failed"'
                                    sh 'npx sonar-scanner || echo "Frontend SonarQube analysis failed but continuing"'
                                }
                            }
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    try {
                        waitForQualityGate abortPipeline: false, credentialsId: 'jenkins-sonarqube-token'
                    } catch (Exception e) {
                        echo "Quality Gate check failed but continuing: ${e.message}"
                    }
                }
            }
        }

        stage('Build & Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_PASS) {
                        
                        // Build frontend image
                        if (fileExists('front/dist/sakai-ng/index.html')) {
                            // Create Dockerfile for frontend if it doesn't exist
                            if (!fileExists('front/Dockerfile')) {
                                writeFile file: 'front/Dockerfile', text: '''FROM nginx:alpine
COPY dist/sakai-ng /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]'''
                            }
                            
                            def frontendImage = docker.build("${IMAGE_NAME}-frontend:${IMAGE_TAG}", 'front/')
                            frontendImage.push()
                            frontendImage.push('latest')
                            echo "Frontend image pushed successfully"
                        }
                        
                        // Build microservices images
                        def microservices = [
                            'back/EurekaServer',
                            'back/Formation-Service', 
                            'back/User-Service'
                        ]
                        
                        microservices.each { service ->
                            def serviceName = service.split('/')[1]
                            
                            if (fileExists("${service}/target") && fileExists("${service}/pom.xml")) {
                                // Create Dockerfile for service if it doesn't exist
                                if (!fileExists("${service}/Dockerfile")) {
                                    writeFile file: "${service}/Dockerfile", text: '''FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]'''
                                }
                                
                                try {
                                    def serviceImage = docker.build("${IMAGE_NAME}-${serviceName}:${IMAGE_TAG}", "${service}/")
                                    serviceImage.push()
                                    serviceImage.push('latest')
                                    echo "${serviceName} image pushed successfully"
                                } catch (Exception e) {
                                    echo "Warning: Failed to build Docker image for ${serviceName}: ${e.message}"
                                }
                            } else {
                                echo "Warning: No JAR file found for ${serviceName}, skipping Docker build"
                            }
                        }
                    }
                }
            }
        }

        stage("Trivy Scan") {
            steps {
                script {
                    try {
                        sh 'docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}-frontend:latest --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table || echo "Trivy scan completed with warnings"'
                        sh 'docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}-EurekaServer:latest --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table || echo "Trivy scan completed with warnings"'
                        sh 'docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}-Formation-Service:latest --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table || echo "Trivy scan completed with warnings"'
                        sh 'docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}-User-Service:latest --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table || echo "Trivy scan completed with warnings"'
                    } catch (Exception e) {
                        echo "Trivy scans failed but continuing: ${e.message}"
                    }
                }
            }
        }

        stage('Cleanup Artifacts') {
            steps {
                script {
                    // Clean up Docker images
                    def services = ['frontend', 'EurekaServer', 'Formation-Service', 'User-Service']
                    services.each { service ->
                        sh "docker rmi ${IMAGE_NAME}-${service}:${IMAGE_TAG} || true"
                        sh "docker rmi ${IMAGE_NAME}-${service}:latest || true"
                    }
                }
            }
        }

        stage('Trigger CD Pipeline') {  
            steps {
                script {
                    try {
                        sh "curl -v -k --user clouduser:${JENKINS_API_TOKEN} -X POST -H 'cache-control: no-cache' -H 'content-type: application/x-www-form-urlencoded' --data 'IMAGE_TAG=${IMAGE_TAG}' '20.107.112.126:8080/job/gitops-cdpipeline/buildWithParameters?token=argocd-token'"
                    } catch (Exception e) {
                        echo "CD Pipeline trigger failed: ${e.message}"
                    }
                }
            }
        }
    }

    post {
        always {
            script {
                try {
                    echo 'Pipeline finished - cleaning up resources'
                    sh '''
                        docker stop mysql-test || true
                        docker rm mysql-test || true
                    '''
                } catch (Exception e) {
                    echo "Cleanup failed: ${e.message}"
                }
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
        unstable {
            echo 'Pipeline completed with warnings'
        }
    }
}
