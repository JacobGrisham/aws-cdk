import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { aws_sqs as sqs } from 'aws-cdk-lib';

export interface HitCounterProps {
  readCapacity?: number;
  queue: sqs.Queue;
}

export class HitCounter extends Construct {

  // 👇 allow access to the counter function
  public readonly handler: lambda.Function;
  // 👇 allow access to the dynamoDB table
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: HitCounterProps) {
    if (props.readCapacity !== undefined && (props.readCapacity < 5 || props.readCapacity > 20)) {
      throw new Error('readCapacity must be greater than 5 and less than 20');
    }
    super(scope, id);

    // 👇 create dynamoDB hit counter table
    this.table = new dynamodb.Table(this, 'Hits', {
        partitionKey: { name: 'path', type: dynamodb.AttributeType.STRING },
        readCapacity: props.readCapacity ?? 5
    });

    // 👇 create lambda with connection to dynamoDB and trigger with SQS
    this.handler = new lambda.Function(this, 'HitCounterHandler', {
        runtime: lambda.Runtime.NODEJS_14_X,
        handler: 'hitcounter.handler',
        code: lambda.Code.fromAsset('lambda'),
        events: [new SqsEventSource(props.queue)],
        environment: {
            HITS_TABLE_NAME: this.table.tableName
        }
    });
    
    // 👇 grant the lambda role read/write permissions to our table
    this.table.grantWriteData(this.handler);
  }
}