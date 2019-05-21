pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q = credentials('client_secret')
        proxy = 'http://webproxy-internett.nav.no:8088'
        https_proxy = 'http://webproxy-internett.nav.no:8088'
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
                sh 'env'
                sh 'node src/addapp.js'
            }
        }
    }
}