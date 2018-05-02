import { Container } from 'inversify';
import { ITruckService } from '../application/services/itruck.service';
import { IMessagePublisher } from '../infrastructure/messaging/imessage.publisher';
import {
  getDatabaseClient,
  MongoDbClient
} from '../infrastructure/mongodb/mongodb.client';
import { MongoDbTruckRepository } from '../infrastructure/mongodb/mongodb.truck.repository';
import { RabbitMQMessagePublisher } from '../infrastructure/rabbitmq/rabbitmq.message.publisher';
import { ITruckRepository } from '../infrastructure/repository/itruck.repository';
// tslint:disable-next-line:max-line-length
import { RepositoryAndMessageBrokerTruckService } from '../infrastructure/services/repository.messagebroker.truck.service';
import { TYPES } from './types';

const diContainer = new Container();

diContainer
  .bind<IMessagePublisher>(TYPES.IMessagePublisher)
  .to(RabbitMQMessagePublisher);
diContainer
  .bind<ITruckRepository>(TYPES.ITruckRepository)
  .to(MongoDbTruckRepository);
diContainer
  .bind<ITruckService>(TYPES.ITruckService)
  .to(RepositoryAndMessageBrokerTruckService);

export { diContainer };
