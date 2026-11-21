pipeline {
    agent any

    stages {
        stage('Setup & Test') {
            steps {
                sh 'python3 -m venv venv'
                sh './venv/bin/pip install -r requirements.txt build'
                sh './venv/bin/pytest'
            }
        }

        stage('Build Package') {
            steps {
                // Builds .whl and .tar.gz inside a dist/ folder
                sh './venv/bin/python -m build'
            }
        }
    }

    post {
        success {
            // Saves the built files in Jenkins so you can download/deploy them
            archiveArtifacts artifacts: 'dist/*', fingerprint: true
        }
    }
}
