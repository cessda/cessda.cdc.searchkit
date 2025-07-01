/**
# Copyright CESSDA ERIC 2017-2025
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License.
# You may obtain a copy of the License at
# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
*/
pipeline {
	environment {
		product_name = "coordinate"
		module_name = "portal"
		image_tag = "${DOCKER_ARTIFACT_REGISTRY}/${product_name}-${module_name}:${env.BRANCH_NAME.toLowerCase().replaceAll('[^a-z0-9\\.\\_\\-]', '-')}-${env.BUILD_NUMBER}"
		scannerHome = tool 'sonar-scanner'
	}

	agent {
		label 'jnlp-himem'
	}

	stages {
		stage('Install NPM dependencies') {
			steps {
				configFileProvider([configFile(fileId: 'be684558-5540-4ad6-a155-7c1b4278abc0', targetLocation: '.npmrc')]) {
					sh 'docker build --target build .'
				}
			}
		}
		stage('Configure Node.JS test environment') {
			agent {
				dockerfile {
					additionalBuildArgs '--target build'
					filename 'Dockerfile'
					reuseNode true
				}
			}
			stages {
				stage('Setup node_modules') {
					steps {
						// Copy node_modules from the Docker container to the build directory
						sh 'cp --recursive /usr/src/app/node_modules/ "$PWD/node_modules/"'

						// npm install needs to be run so that NPM scripts execute correctly
						sh 'npm install'
					}
				}
				stage('Lint Project') {
					steps {
						sh 'npm run lint -- --format checkstyle --output-file eslint/report.xml'
					}
					post {
						always {
							recordIssues(enabledForFailure: true, tools: [esLint(pattern: 'eslint/report.xml')])
						}
					}
				}
				stage('Run Unit Tests') {
					steps {
						sh "npm test"
					}
					post {
						always {
							junit 'junit.xml'
						}
					}
				}
			}
		}
		stage('Build Docker image') {
			 steps {
				sh("docker build -t ${image_tag} .")
			}
		}
		stage('Run Sonar Scan') {
			steps {
				nodejs('node-16') {
					withSonarQubeEnv('cessda-sonar') {
						sh "${scannerHome}/bin/sonar-scanner"
					}
				}
				waitForQualityGate abortPipeline: false
			}
			when { branch 'main' }
		}
		stage('Push Docker image') {
			steps {
				sh("gcloud auth configure-docker ${ARTIFACT_REGISTRY_HOST}")
				sh("docker push ${image_tag}")
				sh("gcloud container images add-tag ${image_tag} ${DOCKER_ARTIFACT_REGISTRY}/${product_name}-${module_name}:${env.BRANCH_NAME}-latest")
			}
			when { branch 'main' }
		}
		stage('Check Requirements and Deployments') {
			steps {
				build job: 'cessda.cdc.deploy/main', parameters: [string(name: 'coordiante_portal_image_tag', value: "${env.BRANCH_NAME}-${env.BUILD_NUMBER}")], wait: false
			}
			when { branch 'main' }
		}
	}
}
