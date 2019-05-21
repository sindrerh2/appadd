pipeline {
    agent { dockerfile true }
    stages {
        environment {
            client_secret_Q= credentials('client_secret')
    }
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