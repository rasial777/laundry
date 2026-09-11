@groovy.transform.Field String VERSION

@NonCPS
String extractBaseVersion(String pom) {
    def matcher = pom =~ /<artifactId>laundry-app<\/artifactId>\s*<version>([0-9.]+)<\/version>/
    return matcher.find() ? matcher.group(1) : null
}

pipeline {
    agent any

    environment {
        NEXUS_CREDENTIALS_ID = 'nexus_cred'
    }

    options {
        // Отключаем автоматический checkout
        skipDefaultCheckout()
    }

    stages {
        stage('Clean ws before build') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Set build number into version') {
            steps {
                script {
                    def pom = readFile('pom.xml')
                    def baseVersion = extractBaseVersion(pom)
                    if (!baseVersion) {
                        error "Project version not found in pom.xml"
                    }

                    echo "Base version from pom: ${baseVersion}"

                    def parts = baseVersion.tokenize('.')
                    parts[parts.size() - 1] = env.BUILD_NUMBER
                    VERSION = parts.join('.')

                    echo "New project version: ${VERSION}"
                    sh "mvn -B versions:set -DnewVersion=${VERSION} -DprocessAllModules"
                    sh 'mvn -B versions:commit'
                }
            }
        }

        stage('Maven package') {
            steps {
                sh 'mvn -B clean package verify'
            }
        }

        stage('Build docker image') {
            steps {
                sh "docker build -f Dockerfile --build-arg VERSION=${VERSION} -t rasial777/laundry:${VERSION} ."
                echo "Saving docker image rasial777/laundry:${VERSION}"
                sh "docker save rasial777/laundry:${VERSION} | gzip > laundry-app-docker-${VERSION}.tar.gz"
            }
        }

        stage('Push docker image to Nexus') {
            when {
                expression { env.JOB_NAME.contains('release') }
            }
            steps {
                script {
                    def nexusHost = env.NEXUS_DOCKER_URL
                            .replaceAll(/^https?:\/\//, '')
                            .replaceAll(/\/+$/, '')
                    def nexusImage = "${nexusHost}/rasial777/laundry:${VERSION}"

                    withCredentials([usernamePassword(
                            credentialsId: NEXUS_CREDENTIALS_ID,
                            usernameVariable: 'NEXUS_USER',
                            passwordVariable: 'NEXUS_PASS'
                    )]) {
                        sh """
                            echo "\${NEXUS_PASS}" | docker login ${nexusHost} -u "\${NEXUS_USER}" --password-stdin
                            docker tag rasial777/laundry:${VERSION} ${nexusImage}
                            docker push ${nexusImage}
                            docker rmi ${nexusImage} || true
                            docker rmi rasial777/laundry:${VERSION} || true
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            sh "docker rmi rasial777/laundry:${VERSION} || true"
        }
        success {
            cleanWs()
        }
    }
}