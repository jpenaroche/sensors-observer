import { run } from './server';
import { database } from './config';
import { Container, ErrorHandler, Queue, Logger } from './lib';
import { TaskService } from './api/services';
import { TaskRepository } from './api/repositories';
import * as config from './config';

const cache = {};

const initContainer = () => {
  const container = new Container();
  container.singleton('Config', config);
  container.singleton('Cache', cache);
  container.singleton('Logger', Logger);
  container.singleton('Queue', Queue, ['Logger', 'Config']);
  return container;
};

const bootstrap = async () => {
  //Connecting to Atlas Cluster
  const container = initContainer();

  return {
    container,
  };
};

// Bootstrap all connections and send it to server using context definition
bootstrap().then(run);

// get the unhandled rejection and throw it to another fallback handler we already have.
process.on('unhandledRejection', (reason) => {
  throw reason;
});

process.on('uncaughtException', (err) => {
  ErrorHandler.handleError(err);
  if (!ErrorHandler.isTrustedError(err)) {
    process.exit(1);
  }
});
