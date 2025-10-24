import { SQSHandler, SQSBatchResponse } from 'aws-lambda';
import { UserScanMessage } from '../../shared/sqs';
import { userFetch } from './userFetch';

export const handler: SQSHandler = async (event) => {
  const response: SQSBatchResponse = {
    batchItemFailures: [],
  };

  for (const record of event.Records) {
    try {
      const message = JSON.parse(record.body) as UserScanMessage;
      await userFetch(message);
    } catch (error) {
      console.error(`Record ${record.messageId} handling error:`, error);
      response.batchItemFailures.push({
        itemIdentifier: record.messageId,
      });
    }
  }

  return response;
};
