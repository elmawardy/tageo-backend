pipeline {
    agent any

    stages {
        stage('Init') {
            steps {
                updateGitlabCommitStatus name: 'init', state: 'pending'
                echo 'Allah Akbar'
                updateGitlabCommitStatus name: 'init', state: 'success'
            }
        }
    }
}