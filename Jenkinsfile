pipeline {
    agent any

    stages {
        stage('Checkout') { checkout scm }
        stage('Init') {
            steps {
                updateGitlabCommitStatus name: 'build', state: 'pending'
                echo 'Allah Akbar'
                updateGitlabCommitStatus name: 'build', state: 'success'
            }
        }
    }
}