pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q= credentials('client_secret')
    }
    stages {
        stage('Test') {
            steps {
                sh 'node --version'
                sh 'svn --version'
            }
        }
        stage('Run') {
            steps {
                sh 'node src/addapp.js'
            }
        }
    }
}