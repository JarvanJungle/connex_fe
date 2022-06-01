pipeline {
  agent any
  
  options {
     office365ConnectorWebhooks([
        [
            startNotification: true,
            notifySuccess: true,
            notifyFailure: true,
            timeout: 30000,
            url: 'https://doxahi.webhook.office.com/webhookb2/8e4d5b35-bbce-4626-ab93-54a2f6a18f5a@7e62cb42-2f83-4a2c-b061-b40fcf5e97b0/JenkinsCI/73db855053af4135b94cf84d56a79acc/42a98973-eea5-4345-9355-014be2e083e7'
        ]]
    )
  }
  tools { nodejs "node14" }

  environment {
    REGISTRY_URI = 'dkr.ecr.ap-southeast-1.amazonaws.com'
    DEV_USERID = '750655480130'
    UAT_USERID = '556257862131'
    DEV_REPO = 'doxa-connex-dev/fe-portal'
    UAT_REPO = 'doxa-connex-uat/fe-portal'
    STAG_REPO = 'doxa-connex-stag/fe-portal'
    PROD_REPO = 'doxa-connex-prod/fe-portal'
    PROD_USERID = '750655480130' // TODO: Change to production registry
  }

  stages {
    stage('Set variables') {
      parallel {
        stage('Set variables for STAGE') {
          when { anyOf { branch 'release/develop'; branch 'release/uat';branch 'release/stag'; branch 'release/production';} }
          steps {
            script {
              def myRepo = checkout scm
              def gitCommit = myRepo.GIT_COMMIT
              def gitBranch = myRepo.GIT_BRANCH
              def branchDelimitted = gitBranch.split('/')
              def stageName = branchDelimitted[1].trim()
              def shortGitCommit = "${gitCommit[0..8]}"
              def imageTag = "${shortGitCommit}-${BUILD_NUMBER}"

              switch (stageName) {
                case 'develop':
                  STAGE="development"
                  REPO = "${env.DEV_REPO}"
                  USERID = "${env.DEV_USERID}"
                  CLUSTER = "${env.DEV_CLUSTER}"
                  NAMESPACE = "development"
                  REPLICAS = '1'
                  KUBE_CREDENTIALS = 'eks_dev_secret'
                  ECR_CREDENTIALS = 'ecr-credential-development'
                  break
                case 'stag':
                  STAGE = "stag"
                  REPO = "${env.STAG_REPO}"
                  NAMESPACE = "stagging"
                  CLUSTER = "${env.DEV_CLUSTER}"
                  REPLICAS = '1'
                  KUBE_CREDENTIALS = 'eks_dev_secret'
                  ECR_CREDENTIALS = 'ecr-credential-development'
                  USERID = "${env.DEV_USERID}"
                  break
                case 'uat':
                  STAGE = "uat"
                  CLUSTER = "${env.UAT_CLUSTER}"
                  REPO = "${env.UAT_REPO}"
                  NAMESPACE = "uat"
                  REPLICAS = '1'
                  KUBE_CREDENTIALS = 'eks_uat_secret'
                  ECR_CREDENTIALS = 'ecr-credential-uat'
                  USERID = "${env.UAT_USERID}"
                  break
                case 'production':
                  NAMESPACE = "production"
                  CLUSTER = "${env.PROD_CLUSTER}"
                  REPLICAS = '2'
                  KUBE_CREDENTIALS = 'eks_prod_secret'
                  ECR_CREDENTIALS = 'ecr-credential-prod'
                  REPO = "${env.DEV_REPO}" // TODO: Update for production
                  USERID = "${env.DEV_USERID}" // TODO: Update for production
                  break
              }
              DOCKER_IMAGE_REGISTORY = "${USERID}.${REGISTRY_URI}/${REPO}"
              DOCKER_IMAGE_FULLPATH = "https://${USERID}.${REGISTRY_URI}"
              IMAGE_TAG = "${imageTag}"
              QA_IMAGE_TAG="${IMAGE_TAG}-qa"
              DEF_CREDENTIALS = "${ECR_CREDENTIALS}"
              DEF_KUBE_CREDENTIALS = "${KUBE_CREDENTIALS}"
              DEF_NAMESPACE = "${NAMESPACE}"
              DEF_NAMESPACE_QA = "qa"
              DEF_REPLICAS = "${REPLICAS}"
            }
          }
        }
      }
    }

    stage('Build package') {
      when { anyOf { branch 'release/develop'; branch 'release/uat';branch 'release/stag'; branch 'release/production';} }
      steps {
        script {
          sh "npm install"
        }
      }
    }

    stage('Build application') {
      when { anyOf { branch 'release/develop'; branch 'release/uat';branch 'release/stag'; branch 'release/production';} }
      steps {
        script {
          sh "npm run build:${STAGE}"
        }
      }
    }
    
    stage('Create Docker images & push to ECR') {
      when { anyOf { branch 'release/develop'; branch 'release/uat';branch 'release/stag'; branch 'release/production';} }
      steps {
        script {
          withDockerRegistry(credentialsId: "ecr:ap-southeast-1:${DEF_CREDENTIALS}", toolName: 'docker', url: "${DOCKER_IMAGE_FULLPATH}") {
            sh "docker build -t ${DOCKER_IMAGE_REGISTORY}:${IMAGE_TAG} -f Dockerfile ."
            sh "docker push ${DOCKER_IMAGE_REGISTORY}:${IMAGE_TAG}"
          }
        }
      }
    }

    stage('Deploy to kubernetes') {
      when { anyOf { branch 'release/develop'; branch 'release/uat';branch 'release/stag'; branch 'release/production';} }
      steps {
        // TODO: Update server details for production
        withKubeConfig([credentialsId: "${DEF_KUBE_CREDENTIALS}", serverUrl: "${CLUSTER}"]) {
          sh "sed -i.bak 's#{replicas}#${DEF_REPLICAS}#' ./deployment/fe-portal.deployment.yml"
          sh "sed -i.bak 's#{container_image}#${DOCKER_IMAGE_REGISTORY}:${IMAGE_TAG}#' ./deployment/fe-portal.deployment.yml"
          sh "/usr/local/bin/kubectl apply -f ./deployment/fe-portal.deployment.yml --namespace ${DEF_NAMESPACE}"
          sh "/usr/local/bin/kubectl apply -f ./deployment/fe-portal.service.yml --namespace ${DEF_NAMESPACE}"
        }
      }
    }

    // Deploy to QA environment
    stage('Build QA environment') {
      when { anyOf { branch 'release/develop';} }
      steps {
        script {
          sh "npm run build:qa"
        }
      }
    }
    
    stage('Create Docker images & push to ECR (QA)') {
      when { anyOf { branch 'release/develop'} }
      steps {
        script {
          withDockerRegistry(credentialsId: "ecr:ap-southeast-1:${DEF_CREDENTIALS}", toolName: 'docker', url: "${DOCKER_IMAGE_FULLPATH}") {
            sh "docker build -t ${DOCKER_IMAGE_REGISTORY}:${QA_IMAGE_TAG} -f Dockerfile ."
            sh "docker push ${DOCKER_IMAGE_REGISTORY}:${QA_IMAGE_TAG}"
          }
        }
      }
      }

    stage('Deploy to kubernetes QA') {
       when { anyOf { branch 'release/develop' } }
       steps {
        // TODO: Update server details for production
        withKubeConfig([credentialsId: "${DEF_KUBE_CREDENTIALS}", serverUrl: "${DEV_CLUSTER}"]) {
          sh "sed -i.bak 's#${DOCKER_IMAGE_REGISTORY}:${IMAGE_TAG}#${DOCKER_IMAGE_REGISTORY}:${QA_IMAGE_TAG}#' ./deployment/fe-portal.deployment.yml"
          sh "/usr/local/bin/kubectl apply -f ./deployment/fe-portal.deployment.yml --namespace ${DEF_NAMESPACE_QA}"
          sh "/usr/local/bin/kubectl apply -f ./deployment/fe-portal.service.yml --namespace ${DEF_NAMESPACE_QA}"
        }
      }
    }


  }
  
    /*** workspace clean up*/
    post { 
        always { 
            cleanWs()
        }

    }
}