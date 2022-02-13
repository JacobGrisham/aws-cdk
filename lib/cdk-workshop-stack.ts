import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { HitCounter } from './hitcounter';
import { TableViewer } from 'cdk-dynamo-table-viewer';

export class CdkWorkshopStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // defines an AWS Lambda resource
    const hello = new lambda.Function(this, 'HelloHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,      // execution environment
      code: lambda.Code.fromAsset('lambda'),    // code loaded from "lambda" directory
      handler: 'hello.handler',                 // file is "hello", function is "handler"
    })
    
    const helloWithCounter = new HitCounter(this, 'HelloHitCounter', {
      downstream: hello                         // request is relayed to the hello function
    });
    
    // defines an API Gateway REST API resource backed by our "hello" function.
    const api = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: helloWithCounter.handler        //whenever our endpoint is hit, API Gateway will route the request to our hit counter handler
    });
    
    new TableViewer(this, 'ViewHitCounter', {
      title: 'Hello Hits',
      table: helloWithCounter.table, 
    });
  }
}
