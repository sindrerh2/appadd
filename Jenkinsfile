pipeline {
    agent { dockerfile true }
    environment {
        client_secret_Q = credentials('client_secret_Q')
        VAULT_ADDR = 'http://127.0.0.1:8200'
        //VAULT_TOKEN = credentials('VAULT_TOKEN')
        proxy = 'http://webproxy-utvikler.nav.no:8088'
        https_proxy = 'http://webproxy-utvikler.nav.no:8088'
        role_id = '6c6245db-7990-5efd-e48e-2cbf6f918822'
        secret_id = credentials('6c6245db-7990-5efd-e48e-2cbf6f918822')
    }
    stages
        stage('Run nodeapp') {
            steps {
                sh 'node src/addapp.js'
            }
        }
    }
}