#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { WorkshopPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();
// 👇 since the purpose of our pipeline is to deploy our application stack, we no longer want the main CDK application to deploy our original app. Instead, we can change the entry point to deploy our pipeline, which will in turn deploy the application.
new WorkshopPipelineStack(app, 'CdkWorkshopPipelineStack', {
    // If you don't specify 'env', this stack will be environment-agnostic.
    // Account/Region-dependent features and context lookups will not work,
    // but a single synthesized template can be deployed anywhere.
  
    // Uncomment the next line to specialize this stack for the AWS Account and Region that are implied by the current CLI configuration:
    // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
  
    // Uncomment the next line if you know exactly what Account and Region you want to deploy the stack to:
    // env: { account: '123xxxyyyzzz', region: 'us-east-1' },
});
