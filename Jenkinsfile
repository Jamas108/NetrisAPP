pipeline {
    agent any
    
    environment {
        ANDROID_HOME = '/opt/android-sdk'
        GRADLE_USER_HOME = "${WORKSPACE}/.gradle"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            agent {
                docker {
                    image 'react-native-builder:latest'
                    args '-v $HOME/.npm:/root/.npm'
                    reuseNode true
                }
            }
            steps {
                echo '📦 Installing npm dependencies...'
                sh 'npm ci'
            }
        }
        
        stage('Run Tests') {
            agent {
                docker {
                    image 'react-native-builder:latest'
                    reuseNode true
                }
            }
            steps {
                echo '🧪 Running tests...'
                sh 'npm test -- --ci --coverage'
            }
        }
        
        stage('Lint Code') {
            agent {
                docker {
                    image 'react-native-builder:latest'
                    reuseNode true
                }
            }
            steps {
                echo '🔍 Running ESLint...'
                sh 'npm run lint || true'
            }
        }
        
        stage('Build Android APK') {
            agent {
                docker {
                    image 'react-native-builder:latest'
                    args '-v $HOME/.gradle:/root/.gradle'
                    reuseNode true
                }
            }
            steps {
                echo '🔨 Building Android APK with Expo...'
                
                withCredentials([
                    file(credentialsId: 'android-keystore', variable: 'KEYSTORE_FILE'),
                    string(credentialsId: 'keystore-password', variable: 'KEYSTORE_PASSWORD'),
                    string(credentialsId: 'key-alias', variable: 'KEY_ALIAS')
                ]) {
                    sh '''
                        # Expo prebuild untuk generate native code
                        npx expo prebuild --platform android --clean
                        
                        # Copy keystore ke android/app
                        mkdir -p android/app
                        cp $KEYSTORE_FILE android/app/my-release-key.keystore
                        
                        # Update gradle.properties
                        cat >> android/gradle.properties <<EOF
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=${KEY_ALIAS}
MYAPP_RELEASE_STORE_PASSWORD=${KEYSTORE_PASSWORD}
MYAPP_RELEASE_KEY_PASSWORD=${KEYSTORE_PASSWORD}
EOF
                        
                        # Build APK
                        cd android
                        ./gradlew assembleRelease --no-daemon
                        
                        # Copy APK ke workspace root
                        cp app/build/outputs/apk/release/app-release.apk ../mydevopsapp.apk
                    '''
                }
            }
        }
        
        stage('Archive APK') {
            steps {
                echo '📦 Archiving APK artifact...'
                archiveArtifacts artifacts: 'mydevopsapp.apk', fingerprint: true
            }
        }
        
        stage('Build AAB for Play Store') {
            agent {
                docker {
                    image 'react-native-builder:latest'
                    args '-v $HOME/.gradle:/root/.gradle'
                    reuseNode true
                }
            }
            steps {
                echo '📦 Building Android App Bundle (AAB)...'
                
                withCredentials([
                    file(credentialsId: 'android-keystore', variable: 'KEYSTORE_FILE'),
                    string(credentialsId: 'keystore-password', variable: 'KEYSTORE_PASSWORD'),
                    string(credentialsId: 'key-alias', variable: 'KEY_ALIAS')
                ]) {
                    sh '''
                        cd android
                        ./gradlew bundleRelease --no-daemon
                        cp app/build/outputs/bundle/release/app-release.aab ../mydevopsapp.aab
                    '''
                }
                
                archiveArtifacts artifacts: 'mydevopsapp.aab', fingerprint: true
            }
        }
        
        stage('Prepare for Play Store') {
            steps {
                echo '🚀 AAB ready for Play Store upload!'
                echo 'Download artifact: mydevopsapp.aab'
                echo '📝 Next: Manual upload to Google Play Console'
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo '📱 APK: mydevopsapp.apk'
            echo '📦 AAB: mydevopsapp.aab'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}