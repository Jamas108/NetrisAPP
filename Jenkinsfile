pipeline {
    agent {
        docker {
            image 'react-native-eas:latest'
            args '-u root:root -v /tmp:/tmp'
        }
    }

    environment {
        EXPO_TOKEN = credentials('expo-token')
    }

    stages {
        stage('Docker Environment') {
            steps {
                echo '🐳 =========================================='
                echo '🐳 Docker container react-native-eas berhasil dijalankan!'
                echo '🐳 Semua build akan dijalankan di dalam container ini.'
                echo '🐳 =========================================='
                sh '''
                    echo "Container info:"
                    cat /etc/os-release | grep PRETTY_NAME
                    echo "Node version:"
                    node -v
                    echo "NPM version:"
                    npm -v
                '''
            }
        }

        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }

        // ...lanjutan stage kamu yang lain (Install, Build, dll)
    }

    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline Completed Successfully inside Docker!'
            echo '✅ ========================================='
        }
        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline Failed (inside Docker container)!'
            echo '❌ ========================================='
        }
    }
}
