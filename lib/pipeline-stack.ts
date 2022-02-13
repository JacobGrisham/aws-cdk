import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {CodeBuildStep, CodePipeline, CodePipelineSource} from "aws-cdk-lib/pipelines";
import { Construct } from 'constructs';

export class WorkshopPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Creates a CodeCommit repository called 'WorkshopRepo'
        new codecommit.Repository(this, 'WorkshopRepo', {
          repositoryName: "WorkshopRepo"
        });

        // The basic pipeline declaration. This sets the initial structure
        // of our pipeline
        const pipeline = new CodePipeline(this, 'Pipeline', {
          pipelineName: 'WorkshopPipeline',
          synth: new CodeBuildStep('SynthStep', {
                  input: CodePipelineSource.codeCommit('WorkshopRepo', 'main'),
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
