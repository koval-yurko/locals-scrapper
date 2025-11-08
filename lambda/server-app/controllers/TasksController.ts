import { Controller, Route, Get, Post, Body, Security } from 'tsoa';
import { TaskRepository } from '../../../shared/repositories/TaskRepository';
import { pushUserScanMessage } from '../../../shared/sqs';
import { LocalsAPI } from '../../../shared/locals';
import { config } from '../config';

type ScanEventState = {
  page: number;
  scanned: number;
};

type ScanEventParams = {
  id: string;
};

@Route('tasks')
export class TasksController extends Controller {
  private taskRepository: TaskRepository;
  private locals: LocalsAPI;

  constructor(taskRepository: TaskRepository, locals: LocalsAPI) {
    super();
    this.taskRepository = taskRepository;
    this.locals = locals;
  }

  @Security('ApiKeyAuth')
  @Get()
  async getTasks() {
    const items = await this.taskRepository.getTasks();
    return { items, count: items.length };
  }

  @Security('ApiKeyAuth')
  @Post('scan-event')
  async scanEvent(@Body() body: ScanEventParams) {
    const state = {
      page: 1,
      scanned: 0,
    };
    console.log('Scanning event', body.id);
    await this.scanEventPage(body.id, state);
    console.log('Scanned event', body.id);

    return { scanned: state.scanned };
  }

  private async scanEventPage(eventId: string, state: ScanEventState) {
    console.log('Scanning event', eventId, state.page);

    try {
      while (true) {
        try {
          const participants = await this.locals.getEventParticipants({
            id: eventId,
            page: state.page,
          });

          // Validate response structure
          if (!participants || !Array.isArray(participants.results)) {
            console.error(
              'Invalid response structure from getEventParticipants',
              {
                eventId,
                page: state.page,
                participants,
              },
            );
            throw new Error('Invalid response structure from API');
          }

          console.log(
            'Scanning participants',
            eventId,
            state.page,
            'count:',
            participants.results.length,
          );

          for (const participant of participants.results) {
            // Validate participant structure
            if (!participant || !participant.user || !participant.user.id) {
              console.error('Invalid participant structure', {
                eventId,
                page: state.page,
                participant,
              });
              continue; // Skip invalid participants but continue processing
            }

            state.scanned++;
            try {
              await pushUserScanMessage(
                { userId: `${participant.user.id}` },
                {
                  queueUrl: config.AWS_SQS_USER_SCAN_QUEUE_URL,
                  // queueUrl: config.AWS_SQS_USER_SCAN_GO_QUEUE_URL,
                  region: config.AWS_REGION,
                },
              );
            } catch (error) {
              console.error(
                'Failed to push user scan message',
                participant.user.id,
                error,
              );
              // Continue processing other participants even if one fails
            }
          }

          console.log('Scanned participants', eventId, state.scanned);

          if (!participants.next) {
            break;
          }

          state.page++;
        } catch (apiError) {
          console.error('Failed to fetch participants for page', {
            eventId,
            page: state.page,
            error: apiError,
          });

          // If it's a rate limit or temporary error, we could retry
          // For now, we'll break to avoid infinite loops
          if (
            apiError instanceof Error &&
            (apiError.message.includes('rate limit') ||
              apiError.message.includes('429') ||
              apiError.message.includes('timeout'))
          ) {
            console.log('Rate limit or timeout detected, stopping scan');
            break;
          }

          // For other errors, we'll continue to the next page if possible
          state.page++;
          continue;
        }
      }
    } catch (error) {
      console.error('Critical error in scanEventPage', {
        eventId,
        state,
        error,
      });
      throw error; // Re-throw to be handled by the caller
    }
  }
}
