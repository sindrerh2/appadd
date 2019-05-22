pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q = credentials('client_secret')
        proxy = 'http://webproxy-internett.nav.no:8088'
        https_proxy = 'http://webproxy-internett.nav.no:8088'
    }
    stages {
        stage('Run nodeapp') {
            steps {
                sh 'ls -la'
                sh 'pwd'
                sh 'hostname'
                sh ' node --version'
                sh 'node src/addapp.js'
            }
        }
    }
}