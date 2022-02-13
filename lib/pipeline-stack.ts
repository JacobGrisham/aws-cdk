import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // This creates a new CodeCommit repository called 'WorkshopRepo'
        const repo = new codecommit.Repository(this, 'WorkshopRepo', {
          repositoryName: "WorkshopRepo"
        });

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        const pipeline = new CodePipeline(this, 'Pipeline', {
          pipelineName: 'WorkshopPipeline',
          synth: new CodeBuildStep('SynthStep', {
                  input: CodePipelineSource.codeCommit(repo, 'main'),
                  installCommands: [
                      'npm install -g aws-cdk'
                  ],
                  commands: [
                      'npm ci',
                      'npm run build',
                      'npx cdk synth'
                  ]
              }
          )
      });
    }
}
