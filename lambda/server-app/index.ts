import serverless from 'serverless-http';
import { app } from './app';
import type { APIGatewayProxyEvent, Context } from 'aws-lambda';

const serverlessHandler = serverless(app);

export const handler = async (event: APIGatewayProxyEvent, context: Context) => {
  console.log('Lambda event:', JSON.stringify({
    path: event.path,
    httpMethod: event.httpMethod,
    resource: event.resource,
    pathParameters: event.pathParameters,
    requestContext: {
      stage: event.requestContext?.stage,
      resourcePath: event.requestContext?.resourcePath,
    }
  }, null, 2));

  try {
    const result = await serverlessHandler(event, context);
    return result;
  } catch (error) {
    console.error('Lambda handler error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
