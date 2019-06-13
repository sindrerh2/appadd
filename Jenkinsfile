pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q = credentials('client_secret')
        VAULT_ADDR = 'http://10.33.44.103:8200'
        VAULT_TOKEN = credentials('VAULT_TOKEN')
        proxy = 'http://webproxy-utvikler.nav.no:8088'
        https_proxy = 'http://webproxy-utvikler.nav.no:8088'
        //#proxy = 'http://webproxy-internett.nav.no:8088'
        //https_proxy = 'http://webproxy-internett.nav.no:8088'
    }
    stages {
        stage('Run nodeapp') {
            steps {
                sh 'node src/addapp.js'
            }
        }
    }
}