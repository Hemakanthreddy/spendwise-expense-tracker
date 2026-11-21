pipeline {
    agent any

    stages {
        stage('Setup Environment') {
            steps {
                // Create a virtual environment and install dependencies
                sh 'python3 -m venv venv'
                sh './venv/bin/pip install -r requirements.txt'
            }
        }

        stage('Test') {
            steps {
                // Run tests (remove this stage if you don't have tests yet)
                sh './venv/bin/pytest'
            }
        }

        stage('Run Script') {
            steps {
                // Execute your Python file
                sh './venv/bin/python app.py'
            }
        }
    }
}
