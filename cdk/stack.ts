import * as cdk from 'aws-cdk-lib';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { config } from './config';

export type LocalsScrapperInfraStackProps = cdk.StackProps & {
  stage: 'dev' | 'prod';
  domainName: string;
  hostedZoneId: string;
  certificateArn: string;
};

export class LocalsScrapperInfraStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: LocalsScrapperInfraStackProps,
  ) {
    super(scope, id, props);

    const stage = props?.stage || 'dev';

    // Helper function to generate consistent resource names
    const getResourceName = (resourceType: string) =>
      `${this.stackName}-${resourceType}-${stage}`;

    // Helper function to generate consistent resource IDs
    const getResourceId = (resourceType: string) => `${resourceType}-${stage}`;

    const userFetchDlqQueue = new sqs.Queue(
      this,
      getResourceId('UserFetchQueue-DLQ'),
      {
        queueName: getResourceName('UserFetchQueueDLQ'),
        retentionPeriod: cdk.Duration.days(4),
      },
    );

    const userFetchQueue = new sqs.Queue(
      this,
      getResourceId('UserFetchQueue'),
      {
        queueName: getResourceName('UserFetchQueue'),
        visibilityTimeout: cdk.Duration.seconds(30),
        retentionPeriod: cdk.Duration.days(1),
        deadLetterQueue: {
          maxReceiveCount: 3,
          queue: userFetchDlqQueue,
        },
      },
    );

    // const userFetchGoDlqQueue = new sqs.Queue(
    //   this,
    //   getResourceId('UserFetchGoQueue-DLQ'),
    //   {
    //     queueName: getResourceName('UserFetchGoQueueDLQ'),
    //     retentionPeriod: cdk.Duration.days(14),
    //   },
    // );
    //
    // const userFetchGoQueue = new sqs.Queue(this, getResourceId('UserFetchGoQueue'), {
    //   queueName: getResourceName('UserFetchGoQueue'),
    //   visibilityTimeout: cdk.Duration.seconds(30),
    //   retentionPeriod: cdk.Duration.days(4),
    //   deadLetterQueue: {
    //     maxReceiveCount: 3,
    //     queue: userFetchGoDlqQueue,
    //   },
    // });

    // ========== Lambda Functions ==========

    // Server App Lambda - API Handler
    const serverAppLogGroup = new logs.LogGroup(
      this,
      getResourceId('ServerAppLogs'),
      {
        logGroupName: `/aws/lambda/${getResourceName('ServerApp')}`,
        retention: logs.RetentionDays.TWO_WEEKS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const serverAppRole = new iam.Role(this, getResourceId('ServerAppRole'), {
      roleName: `${getResourceName('ServerApp')}-role`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    });

    const serverAppFunction = new lambda.Function(
      this,
      getResourceId('ServerApp'),
      {
        functionName: getResourceName('ServerApp'),
        runtime: lambda.Runtime.NODEJS_20_X,
        code: lambda.Code.fromAsset('dist/lambda/server-app'),
        handler: 'index.handler',
        memorySize: 2048,
        timeout: cdk.Duration.seconds(300),
        role: serverAppRole,
        logGroup: serverAppLogGroup,
        environment: {
          BASE_URL: '/api',
          LOCALS_ACCESS_TOKEN: config.LOCALS_ACCESS_TOKEN,
          DATABASE_URL:
            stage === 'dev'
              ? config.DATABASE_DEV_URL
              : config.DATABASE_PROD_URL,
          VALID_API_KEYS: config.VALID_API_KEYS,
          SUPABASE_JWT_SECRET: config.SUPABASE_JWT_SECRET,
          AWS_SQS_USER_SCAN_QUEUE_URL: userFetchQueue.queueUrl,
          //AWS_SQS_USER_SCAN_GO_QUEUE_URL: userFetchGoQueue.queueUrl,
        },
      },
    );

    // User Fetch Lambda - SQS Consumer
    const userFetchLogGroup = new logs.LogGroup(
      this,
      getResourceId('UserFetchLogs'),
      {
        logGroupName: `/aws/lambda/${getResourceName('UserFetch')}`,
        retention: logs.RetentionDays.TWO_WEEKS,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const userFetchRole = new iam.Role(this, getResourceId('UserFetchRole'), {
      roleName: `${getResourceName('UserFetch')}-role`,
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    });

    const userFetchFunction = new lambda.Function(
      this,
      getResourceId('UserFetch'),
      {
        functionName: getResourceName('UserFetch'),
        runtime: lambda.Runtime.NODEJS_20_X,
        architecture: lambda.Architecture.ARM_64,
        code: lambda.Code.fromAsset('dist/lambda/user-fetch'),
        handler: 'index.handler',
        memorySize: 512,
        timeout: cdk.Duration.seconds(30),
        role: userFetchRole,
        logGroup: userFetchLogGroup,
        environment: {
          LOCALS_ACCESS_TOKEN: config.LOCALS_ACCESS_TOKEN,
          DATABASE_URL:
            stage === 'dev'
              ? config.DATABASE_DEV_URL
              : config.DATABASE_PROD_URL,
        },
      },
    );

    // const userFetchGoLayer = new lambda.LayerVersion(this, 'UserFetch-go-Layer', {
    //   code: lambda.Code.fromAsset('dist/lambda/layers'),
    //   compatibleRuntimes: [lambda.Runtime.PROVIDED_AL2],
    //   description: 'A shared Go library for Lambda functions',
    // });
    //
    // const userFetchGoFunction = new lambda.Function(this, getResourceId('UserFetch-go'), {
    //   functionName: getResourceName('UserFetchGo'),
    //   runtime: lambda.Runtime.PROVIDED_AL2,
    //   architecture: lambda.Architecture.ARM_64,
    //   code: lambda.Code.fromAsset('dist/lambda/user-fetch-go'),
    //   handler: 'lambda.handler',
    //   memorySize: 2048,
    //   timeout: cdk.Duration.seconds(30),
    //   layers: [userFetchGoLayer],
    //   environment: {
    //     DATABASE_URL: "",
    //     PRISMA_QUERY_ENGINE_BINARY: 'prisma-query-engine-linux-arm64-openssl-1_1_x',
    //     PATH: '/usr/local/bin:/usr/bin/:/bin:/opt/bin:/var/task:/opt'
    //   },
    // });

    userFetchQueue.grantConsumeMessages(userFetchFunction);
    userFetchQueue.grantSendMessages(serverAppFunction);

    // userFetchGoQueue.grantConsumeMessages(userFetchGoFunction);
    // userFetchGoQueue.grantSendMessages(serverAppFunction);

    const eventSource = new lambdaEventSources.SqsEventSource(userFetchQueue, {
      batchSize: 30,
      maxBatchingWindow: cdk.Duration.seconds(5),
      maxConcurrency: 10,
      reportBatchItemFailures: true,
    });
    userFetchFunction.addEventSource(eventSource);

    // const eventGoSource = new lambdaEventSources.SqsEventSource(userFetchGoQueue, {
    //   batchSize: 30,
    //   maxBatchingWindow: cdk.Duration.seconds(5),
    //   maxConcurrency: 10,
    //   reportBatchItemFailures: true,
    // });
    // userFetchGoFunction.addEventSource(eventGoSource);

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      getResourceId('Certificate'),
      props.certificateArn,
    );

    // Create CloudWatch log group for API Gateway access logs
    const apiGatewayAccessLogGroup = new logs.LogGroup(
      this,
      getResourceId('ApiGatewayLogs'),
      {
        logGroupName: `/aws/apigateway/${getResourceName('ApiGatewayLogs')}`,
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    );

    const api = new apigateway.RestApi(this, getResourceId('RestApi'), {
      restApiName: `LocalsScrapper-${stage}`,
      description: `LocalsScrapper API for ${stage} environment`,
      deploy: false, // We'll create deployment manually
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
        ],
        maxAge: cdk.Duration.days(1),
      },
    });

    // Grant API Gateway permission to invoke the Lambda function
    serverAppFunction.addPermission('ApiGatewayInvoke', {
      principal: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      sourceArn: `arn:aws:execute-api:${this.region}:${this.account}:${api.restApiId}/${stage}/*/*`,
    });

    // Add root proxy to catch all paths
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod(
      'ANY',
      new apigateway.LambdaIntegration(serverAppFunction),
    );

    // Also handle root path
    api.root.addMethod(
      'ANY',
      new apigateway.LambdaIntegration(serverAppFunction),
    );

    // Create deployment and stage manually with fixed names
    const deployment = new apigateway.Deployment(
      this,
      getResourceId('Deployment'),
      {
        api,
      },
    );

    // Ensure deployment happens after methods are added
    deployment.node.addDependency(proxyResource);
    deployment.node.addDependency(api.root);

    const apiStage = new apigateway.Stage(this, getResourceId('Stage'), {
      stageName: stage,
      deployment,
      metricsEnabled: true,
      dataTraceEnabled: true,
      loggingLevel: apigateway.MethodLoggingLevel.INFO,
      accessLogDestination: new apigateway.LogGroupLogDestination(
        apiGatewayAccessLogGroup,
      ),
      accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields(),
    });

    // Create custom domain name
    const domainName = new apigateway.DomainName(
      this,
      getResourceId('DomainName'),
      {
        domainName: props.domainName,
        certificate,
        endpointType: apigateway.EndpointType.REGIONAL,
        securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
      },
    );

    // Create base path mapping explicitly
    new apigateway.BasePathMapping(this, getResourceId('BasePathMapping'), {
      domainName,
      restApi: api,
      stage: apiStage,
      basePath: '', // Empty string maps to root path
    });

    // For API Gateway v1, we need to use the domain name's regional properties
    new route53.CfnRecordSet(this, getResourceId('ApiAliasRecord'), {
      hostedZoneId: props.hostedZoneId,
      name: props.domainName,
      type: 'A',
      aliasTarget: {
        dnsName: domainName.domainNameAliasDomainName,
        hostedZoneId: domainName.domainNameAliasHostedZoneId,
        evaluateTargetHealth: false,
      },
    });

    new cdk.CfnOutput(this, `CustomDomainUrl-${stage}`, {
      value: `https://${props.domainName}`,
      description: 'Custom domain URL for the API',
    });
  }
}
