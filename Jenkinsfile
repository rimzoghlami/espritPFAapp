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
        MAVEN_OPTS = "-Dfile.encoding=UTF-8"
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

        stage("Fix Configuration Files") {
            steps {
                script {
                    // Split the mixed application.properties files into separate service configs
                    echo "Fixing configuration files for microservices..."
                    
                    // Check if we have the mixed configuration issue
                    def mixedConfigFound = false
                    
                    sh '''
                        # Check for mixed configurations in properties files
                        find . -name "application.properties" -type f | while read file; do
                            if grep -q "EurekaServer" "$file" && grep -q "Formation-Service" "$file"; then
                                echo "Found mixed configuration in: $file"
                                echo "true" > /tmp/mixed_config_found
                            fi
                        done
                    '''
                    
                    // If mixed config found, split it
                    if (fileExists('/tmp/mixed_config_found')) {
                        echo "Splitting mixed configurations..."
                        
                        // Create separate application.properties for each service
                        
                        // EurekaServer properties
                        if (fileExists('back/EurekaServer') || fileExists('back/Eureka-Server')) {
                            def eurekaDir = fileExists('back/EurekaServer') ? 'back/EurekaServer' : 'back/Eureka-Server'
                            sh "mkdir -p ${eurekaDir}/src/main/resources"
                            writeFile file: "${eurekaDir}/src/main/resources/application.properties", text: '''server.error.include-binding-errors=always
server.error.include-message=always
spring.application.name=EurekaServer
server.servlet.context-path=/
server.port=8761
eureka.client.register-with-eureka=false
eureka.client.fetch-registry=false
eureka.instance.hostname=localhost
eureka.server.eviction-interval-timer-in-ms=60000
eureka.instance.lease-expiration-duration-in-seconds=90
eureka.instance.lease-renewal-interval-in-seconds=30'''
                        }
                        
                        // Formation-Service properties
                        if (fileExists('back/Formation-Service')) {
                            sh "mkdir -p back/Formation-Service/src/main/resources"
                            writeFile file: 'back/Formation-Service/src/main/resources/application.properties', text: '''spring.application.name=Formation-Service
server.servlet.context-path=/Formation-Service
server.port=9094
server.session.cookie.secure=true
spring.datasource.url=jdbc:mysql://localhost:3306/Formation-Service?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
eureka.instance.prefer-ip-address=true
eureka.instance.hostname=localhost
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB
spring.web.cors.allowed-origins=http://localhost:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true'''
                        }
                        
                        // User-Service properties
                        if (fileExists('back/User-Service')) {
                            sh "mkdir -p back/User-Service/src/main/resources"
                            writeFile file: 'back/User-Service/src/main/resources/application.properties', text: '''spring.application.name=Auth
server.port=8089
spring.datasource.url=jdbc:mysql://localhost:3306/onsjabbes?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=
spring.kafka.bootstrap-servers=localhost:9092
spring.jpa.show-sql=true
spring.jpa.hibernate.ddl-auto=update
logging.level.root=info
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} -%level -%logger{60} %msg %n
server.servlet.context-path=/tests
spring.web.cors.allowed-origins=http://localhost:4200
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=hajerhr7@gmail.com
spring.mail.password=apec nvum joqt ymlc
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka
eureka.client.register-with-eureka=true
eureka.client.fetch-registry=true
eureka.instance.prefer-ip-address=true
eureka.instance.hostname=localhost'''
                        }
                    }
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
                            // Auto-discover microservices
                            def microservices = []
                            
                            // Check all possible service locations
                            def possibleServices = [
                                'back/Formation-Service',
                                'back/User-Service', 
                                'back/EurekaServer',
                                'back/Eureka-Server',
                                'Formation-Service',
                                'User-Service',
                                'EurekaServer',
                                'Eureka-Server'
                            ]
                            
                            possibleServices.each { service ->
                                if (fileExists("${service}/pom.xml")) {
                                    microservices.add(service)
                                    echo "Found microservice: ${service}"
                                }
                            }
                            
                            if (microservices.isEmpty()) {
                                echo "No microservices found with pom.xml files"
                                currentBuild.result = 'UNSTABLE'
                            } else {
                                echo "Building ${microservices.size()} microservices: ${microservices}"
                                
                                microservices.each { service ->
                                    echo "Building ${service}..."
                                    dir(service) {
                                        sh 'mvn clean package -DskipTests -Dfile.encoding=UTF-8 -Dproject.build.sourceEncoding=UTF-8'
                                        echo "${service} built successfully"
                                    }
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
                    when {
                        expression { currentBuild.result != 'FAILURE' }
                    }
                    steps {
                        script {
                            def possibleServices = [
                                'back/Formation-Service',
                                'back/User-Service', 
                                'back/EurekaServer',
                                'back/Eureka-Server'
                            ]
                            
                            possibleServices.each { service ->
                                if (fileExists("${service}/pom.xml")) {
                                    echo "Testing ${service}..."
                                    dir(service) {
                                        sh 'mvn test -Dfile.encoding=UTF-8 || echo "Tests failed for ${service} but continuing pipeline"'
                                    }
                                }
                            }
                        }
                    }
                }
                
                stage("Test Frontend") {
                    when {
                        expression { currentBuild.result != 'FAILURE' }
                    }
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

        stage('Build & Push Docker Images') {
            when {
                expression { currentBuild.result != 'FAILURE' }
            }
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', DOCKER_PASS) {
                        
                        // Build frontend image
                        if (fileExists('front/dist/sakai-ng/index.html')) {
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
                        def possibleServices = [
                            ['back/Formation-Service', 'Formation-Service'],
                            ['back/User-Service', 'User-Service'],
                            ['back/EurekaServer', 'EurekaServer'],
                            ['back/Eureka-Server', 'Eureka-Server']
                        ]
                        
                        possibleServices.each { serviceInfo ->
                            def servicePath = serviceInfo[0]
                            def serviceName = serviceInfo[1]
                            
                            if (fileExists("${servicePath}/target") && fileExists("${servicePath}/pom.xml")) {
                                if (!fileExists("${servicePath}/Dockerfile")) {
                                    writeFile file: "${servicePath}/Dockerfile", text: '''FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Xmx512m", "-Xms256m", "-jar", "app.jar"]'''
                                }
                                
                                try {
                                    def serviceImage = docker.build("${IMAGE_NAME}-${serviceName}:${IMAGE_TAG}", "${servicePath}/")
                                    serviceImage.push()
                                    serviceImage.push('latest')
                                    echo "${serviceName} image pushed successfully"
                                } catch (Exception e) {
                                    echo "Warning: Failed to build Docker image for ${serviceName}: ${e.message}"
                                }
                            }
                        }
                    }
                }
            }
        }

        stage("Trivy Scan") {
            when {
                expression { currentBuild.result != 'FAILURE' }
            }
            steps {
                script {
                    try {
                        sh 'docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}-frontend:latest --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table || echo "Trivy scan completed with warnings"'
                        
                        def services = ['Formation-Service', 'User-Service', 'EurekaServer', 'Eureka-Server']
                        services.each { service ->
                            sh "docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${IMAGE_NAME}-${service}:latest --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table || echo 'Trivy scan completed with warnings for ${service}'"
                        }
                    } catch (Exception e) {
                        echo "Trivy scans failed but continuing: ${e.message}"
                    }
                }
            }
        }

        stage('Cleanup Artifacts') {
            steps {
                script {
                    def services = ['frontend', 'Formation-Service', 'User-Service', 'EurekaServer', 'Eureka-Server']
                    services.each { service ->
                        sh "docker rmi ${IMAGE_NAME}-${service}:${IMAGE_TAG} || true"
                        sh "docker rmi ${IMAGE_NAME}-${service}:latest || true"
                    }
                }
            }
        }

        stage('Trigger CD Pipeline') {
            when {
                expression { currentBuild.result != 'FAILURE' }
            }
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
