pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q = credentials('client_secret_Q')
        VAULT_ADDR = 'https://vault.adeo.no'
        proxy = 'http://webproxy-utvikler.nav.no:8088'
        https_proxy = 'http://webproxy-utvikler.nav.no:8088'
        no_proxy = 'adeo.no'
        AZURE_IAC_APPROLE = credentials('azuread_iac_approle')
    }
    stages {
        stage('Run nodeapp') {
            steps {
                sh 'node src/addapp.js'
            }
        }
    }
}