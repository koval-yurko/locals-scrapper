import { IocContainer, IocContainerFactory } from '@tsoa/runtime';
import { ServiceIdentifier } from 'tsoa';
import { createPrismaClient } from '../../../shared/repositories/prisma';
import { LocalsAPI } from '../../../shared/locals';
import { UserRepository } from '../../../shared/repositories/UserRepository';
import { TaskRepository } from '../../../shared/repositories/TaskRepository';
import { UsersController } from '../controllers/UsersController';
import { TasksController } from '../controllers/TasksController';
import { config } from '../config';

const iocContainer: IocContainerFactory = function (): IocContainer {
  return {
    get<T>(controller: ServiceIdentifier<T>): T {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      const controllerName = (controller as Function).name;

      switch (controllerName) {
        case 'UsersController': {
          const prisma = createPrismaClient();
          const taskRepository = new UserRepository(prisma);
          return new UsersController(taskRepository) as T;
        }
        case 'TasksController': {
          const locals = new LocalsAPI(config.LOCALS_ACCESS_TOKEN);
          const prisma = createPrismaClient();
          const taskRepository = new TaskRepository(prisma);
          return new TasksController(taskRepository, locals) as T;
        }
        default:
          throw new Error(`No matching controller found for ${controllerName}`);
      }
    },
  };
};

export { iocContainer };
