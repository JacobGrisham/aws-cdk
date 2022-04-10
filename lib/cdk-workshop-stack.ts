import { Construct } from 'constructs';
// aws-cdk-lib
// 👇 we're directly importing these classes from the aws-cdk-lib root directory
import { Stack, StackProps, Aws, CfnOutput } from 'aws-cdk-lib'; 
// 👇 for the next handful of lines, we're importing these directories wholesale from aws-cdk-lib and renaming them for convenience
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_sns_subscriptions as subscriptions } from 'aws-cdk-lib';
import { aws_apigateway as apigateway } from 'aws-cdk-lib';
import { aws_lambda as lambda } from 'aws-cdk-lib';
import { aws_sqs as sqs } from 'aws-cdk-lib';
import { aws_sns as sns } from 'aws-cdk-lib';
// 👇 we're directly importing the class SqsEventSource from the aws-cdk-lib directory aws-lambda-event-sources
// 👇 since this is the only class we're using, it's more efficient than wholesale import (assuming this libarary doesn't support tree shaking)
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
// 3rd party
import { TableViewer } from 'cdk-dynamo-table-viewer';
// internal
import { HitCounter } from './hitcounter';

export class CdkWorkshopStack extends Stack {
  public readonly hcViewerUrl: CfnOutput;
  public readonly hcEndpoint: CfnOutput;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 👇 create SNS topic
    const topic = new sns.Topic(this, 'HitTopic')

    // 👇 create first SQS queue
    const queueOne = new sqs.Queue(this, 'HitQueueOne');    
    topic.addSubscription(new subscriptions.SqsSubscription(queueOne));

    // 👇 create second SQS queue
    const queueTwo = new sqs.Queue(this, 'HitQueueTwo');
    topic.addSubscription(new subscriptions.SqsSubscription(queueTwo));

    // 👇 create lambda and add trigger with SQS
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,      // 👈 execution environment
      code: lambda.Code.fromAsset('lambda'),    // 👈 code loaded from "lambda" directory
      handler: 'hello.handler',                 // 👈 file is "hello", function is "handler"
      events: [new SqsEventSource(queueOne)]    // 👈 the first three props are common to all lambdas, this one is specific to this application
    })
    
    // 👇 create construct that contains a definition for creating a lambda with access to dynamoDB and trigger with SQS
    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      queue: queueTwo
    });

    // 👇 allow API Gateway to publish to SNS
    const gatewayExecutionRole: any = new iam.Role(this, "GatewayExecutionRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
      inlinePolicies: {
        "PublishMessagePolicy": new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            actions: ["sns:Publish"],
            resources: [topic.topicArn]
          })]
        })
      }
    });

    // 👇 create API Gateway
    const gateway = new apigateway.RestApi(this, 'Endpoint');
    gateway.root.addMethod('POST',
      new apigateway.AwsIntegration({
        service: 'sns',
        integrationHttpMethod: 'POST',
        path: `${Aws.ACCOUNT_ID}/${topic.topicName}`,
        options: {
          credentialsRole: gatewayExecutionRole, 
          passthroughBehavior: apigateway.PassthroughBehavior.NEVER,
          requestParameters: {
            "integration.request.header.Content-Type": `'application/x-www-form-urlencoded'`,
          },
          requestTemplates: {
            "application/json": `Action=Publish&TopicArn=$util.urlEncode('${topic.topicArn}')&Message=$util.urlEncode($input.body)`,
          },
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `{"status": "message added to topic"}`,
              },
            },
            {
              statusCode: "400",
              selectionPattern: "^\[Error\].*",
              responseTemplates: {
                "application/json": `{\"state\":\"error\",\"message\":\"$util.escapeJavaScript($input.path('$.errorMessage'))\"}`,
              },
            }
          ],
        }
      }),{ methodResponses: [{ statusCode: "200" }, { statusCode: "400" }] }
    );
    
    // 👇 create 3rd party library construct with a bundle of aws resources
    const tv = new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table,
      sortBy: '-hits'
    });

    // 👇 for the last few lines, we're using level 3 (the lowest level) CloudFormation settings
    this.hcEndpoint = new CfnOutput(this, 'GatewayUrl', {
      value: gateway.url
    });

    this.hcViewerUrl = new CfnOutput(this, 'TableViewerUrl', {
      value: tv.endpoint
    });
  }
}
