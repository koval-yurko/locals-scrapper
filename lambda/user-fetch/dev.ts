import './config';
import { SQSEvent, Context } from 'aws-lambda';
import { handler } from './index';

(async () => {
  try {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            userId: '281513',
          }),
          messageId: '123',
        },
        {
          body: JSON.stringify({
            userId: '281513',
          }),
          messageId: '456',
        },
      ],
    } as SQSEvent;
    const context = {} as Context;
    const callback = () => null;
    const res = await handler(event, context, callback);

    console.log('res', res);
  } catch (error) {
    console.error('error', error);
  }
})();
