pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q = credentials('client_secret_Q')
        VAULT_ADDR = 'https://vault.adeo.no'
        //VAULT_ADDR = 'http://127.0.0.1:8200'
        //VAULT_TOKEN = credentials('VAULT_TOKEN')
        //proxy = 'http://webproxy-utvikler.nav.no:8088'
        //https_proxy = 'http://webproxy-utvikler.nav.no:8088'
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