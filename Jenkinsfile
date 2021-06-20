pipeline {
    agent any

    environment {
        IMAGE_TAG = "0.0"
        CURRENT_TAG = "0.0"
    }

    triggers {
        githubPush()
    }

    stages {

        stage("Init"){
            steps{
                sh '''
                    echo "Logging in to Amazon ECR..."
                    aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
                '''
                sh '''
                    echo "calculating next image tag ..."
                    latest="$(aws ecr describe-images --repository-name=${IMAGE_REPO_NAME} --region=${AWS_DEFAULT_REGION}  --query 'sort_by(imageDetails,& imagePushedAt)[-1].imageTags[0]' | jq . --raw-output)"
                    latest=$([ "$latest" == 'null' ] && echo '1.0' || echo "$latest")
                    echo "Latest tag = $latest"
                    iIMAGE_TAG=$(echo "$latest + 1.0" | bc)
                    iIMAGE_TAG=$(echo "scale=1; $iIMAGE_TAG/1" | bc)
                    echo $iIMAGE_TAG > image_tag.txt
                    cat image_tag.txt
                    echo $latest > current_tag.txt
                '''
                script {
                    IMAGE_TAG = readFile('image_tag.txt').trim()
                    CURRENT_TAG = readFile('current_tag.txt').trim()
                }

            }
        }

        stage("Build") {
            steps {
                sh """
                    echo 'tag = ${IMAGE_TAG}'
                    echo 'Building the Docker image...'
                    docker build -t ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}:${IMAGE_TAG} .
                """
            }
        }

        stage("Push Image") {
            steps {
                echo "Pushing the Docker image..."
                sh """
                    docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${IMAGE_REPO_NAME}:${IMAGE_TAG}
                """
            }
        }

        stage("Update k8s on git") {
            steps {
                sh """
                    echo 'Updating k8s deployment image version in git...'
                """
                sh """sed -i 's/052339481502.dkr.ecr.us-east-1.amazonaws.com\\/tageo:[0-9]+\\.[0-9]+/052339481502.dkr.ecr.us-east-1.amazonaws.com\\/tageo:${IMAGE_TAG}/g' k8s/web.deployment.yaml """
                sh """
                    echo k8s/web.deployment.yaml
                    git config user.email "jenkins@ci.elmawardy"
                    git config user.name "jenkins"
                    git add .
                    git commit -m 'update k8s version'
                    git push origin HEAD:master
                """
            }
        }
    }
}