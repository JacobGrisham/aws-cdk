# Welcome to your CDK TypeScript project!

You should explore the contents of this project. It demonstrates a CDK app with an instance of a stack (`CdkWorkshopStack`)
which contains a Proxy Lambda connected to an API Gateway that forwards requests to Lambda connected to a DynamoDB table. The DynamoDB table keeps track of how many requests were recieved per endpoint.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

## References
 * [Cloud9 Setup](https://catalog.us-east-1.prod.workshops.aws/v2/workshops/00bc829e-fd7c-4204-9da1-faea3cf8bd88/en-US/introduction/prep)
 * [AWS CDK Workshop](https://cdkworkshop.com/)
