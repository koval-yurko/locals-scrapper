import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';

const sqsClients: Map<string, SQSClient> = new Map();

export type PushMessageOptions = {
  queueUrl: string;
  region: string;
};

function getSqsClient(options: PushMessageOptions) {
  const { queueUrl, region } = options;
  let sqsClient = sqsClients.get(queueUrl);
  if (!sqsClient) {
    const endpoint = queueUrl.includes('localhost') ? queueUrl : undefined;
    sqsClient = new SQSClient({ region, endpoint });
    sqsClients.set(queueUrl, sqsClient);
  }
  return sqsClient;
}

export type UserScanMessage = {
  userId: string;
};

export const pushUserScanMessage = async (
  message: UserScanMessage,
  options: PushMessageOptions,
) => {
  const sqsClient = getSqsClient(options);

  const command = new SendMessageCommand({
    MessageBody: JSON.stringify(message),
    QueueUrl: options.queueUrl,
  });
  const result = await sqsClient.send(command);
  return result.MessageId;
};
