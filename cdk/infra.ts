import { config } from './config';
import * as cdk from 'aws-cdk-lib';
import { LocalsScrapperInfraStack } from './stack';

const app = new cdk.App();

new LocalsScrapperInfraStack(app, 'LocalsScrapperDevStack', {
  env: {
    account: config.CDK_DEFAULT_ACCOUNT,
    region: config.CDK_DEFAULT_REGION,
  },
  stage: 'dev',
  domainName: config.DOMAIN_NAME,
  hostedZoneId: config.HOSTED_ZONE_ID,
  certificateArn: config.CERTIFICATE_ARN,
});

new LocalsScrapperInfraStack(app, 'LocalsScrapperProdStack', {
  env: {
    account: config.CDK_DEFAULT_ACCOUNT,
    region: config.CDK_DEFAULT_REGION,
  },
  stage: 'prod',
  domainName: config.DOMAIN_NAME,
  hostedZoneId: config.HOSTED_ZONE_ID,
  certificateArn: config.CERTIFICATE_ARN,
});
