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
                withEnv(['HTTPS_PROXY=http://webproxy-utvikler.nav.no:8088']) {
                //sh(script: "git clone https://github.com/${project}/${app}.git -b ${branch} .")
                    sh(script: "git clone git@github.com:navikt/ida-api.git -b master .")
                }
                sh 'node src/addapp.js'
            }
        }
    }
}