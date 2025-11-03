pipeline {
    agent any
    
    environment {
        // Sesuaikan dengan ID credential di Jenkins
        EXPO_TOKEN = credentials('expo-token')  // atau ID lain yang Anda gunakan
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Environment Check') {
            steps {
                echo '========================================='
                echo 'Environment Check'
                echo '========================================='
                sh '''
                    echo "Node version:"
                    node --version
                    echo "NPM version:"
                    npm --version
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '========================================='
                echo 'Installing Dependencies'
                echo '========================================='
                sh 'npm ci'
            }
        }
        
        stage('Install EAS CLI') {
            steps {
                echo '========================================='
                echo 'Installing EAS CLI'
                echo '========================================='
                sh 'npm install eas-cli'
            }
        }
        
        stage('Verify Expo Login') {
            steps {
                echo '========================================='
                echo 'Verifying Expo Login'
                echo '========================================='
                sh '''
                    export EXPO_TOKEN="${EXPO_TOKEN}"
                    npx eas-cli whoami
                '''
            }
        }
        
        stage('Check EAS Configuration') {
            steps {
                echo '========================================='
                echo 'Checking EAS Configuration'
                echo '========================================='
                script {
                    def hasProjectId = sh(
                        script: 'grep -q "projectId" app.json && echo "true" || echo "false"',
                        returnStdout: true
                    ).trim()
                    
                    if (hasProjectId == "false") {
                        echo "⚠️  Project ID not found in app.json"
                        echo "Please run 'eas init' locally first!"
                        error("EAS project not configured")
                    } else {
                        echo "✅ Project ID found in app.json"
                        sh 'grep "projectId" app.json'
                    }
                }
            }
        }
        
        stage('Build Preview APK') {
            steps {
                echo '========================================='
                echo 'Building Preview APK'
                echo '========================================='
                sh '''
                    export EXPO_TOKEN="${EXPO_TOKEN}"
                    npx eas-cli build --platform android --profile preview --non-interactive --no-wait
                '''
            }
        }
        
        stage('Build Production AAB') {
            when {
                branch 'main'
            }
            steps {
                echo '========================================='
                echo 'Building Production AAB'
                echo '========================================='
                sh '''
                    export EXPO_TOKEN="${EXPO_TOKEN}"
                    npx eas-cli build --platform android --profile production --non-interactive --no-wait
                '''
            }
        }
        
        stage('Get Build Status') {
            steps {
                echo '========================================='
                echo 'Build Status'
                echo '========================================='
                sh '''
                    export EXPO_TOKEN="${EXPO_TOKEN}"
                    echo "Recent builds:"
                    npx eas-cli build:list --platform android --limit 5
                    echo ""
                    echo "Check full status: https://expo.dev"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline Completed Successfully!'
            echo '✅ ========================================='
            echo '📱 View builds: https://expo.dev/accounts/jamas5758/projects'
            echo '📥 Download builds from Expo dashboard'
        }
        failure {
            echo '❌ ========================================='
            echo '❌ Pipeline Failed!'
            echo '❌ ========================================='
            echo 'Check logs above for details'
        }
        always {
            echo '🧹 Cleaning up...'
        }
    }
}