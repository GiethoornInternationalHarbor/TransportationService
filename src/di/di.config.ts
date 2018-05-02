import { Container, interfaces } from 'inversify';
import { ITruckService } from '../application/services/itruck.service';
import { IMessagePublisher } from '../infrastructure/messaging/imessage.publisher';
import {
  getDatabaseClient,
  MongoDbClient
} from '../infrastructure/mongodb/mongodb.client';
import { MongoDbTruckRepository } from '../infrastructure/mongodb/mongodb.truck.repository';
import {
  getRabbitMQChannel,
  RabbitMQChannel
} from '../infrastructure/rabbitmq/rabbitmq.channel';
import { RabbitMQMessagePublisher } from '../infrastructure/rabbitmq/rabbitmq.message.publisher';
import { ITruckRepository } from '../infrastructure/repository/itruck.repository';
// tslint:disable-next-line:max-line-length
import { RepositoryAndMessageBrokerTruckService } from '../infrastructure/services/repository.messagebroker.truck.service';
import { TYPES } from './types';

const diContainer = new Container();

export type MessagePublisherProvider = (
  exchange: string
) => Promise<IMessagePublisher>;

diContainer
  .bind<MessagePublisherProvider>(TYPES.MessagePublisherProvider)
  .toProvider<IMessagePublisher>(context => {
    return async (exchange: string) => {
      const channel = context.container.get<RabbitMQChannel>(
        TYPES.RabbitMQChannel
      );

      // We have the connection and channel now
      // Need to assert the exchange (this ensures the exchange exists)
      await channel.assertExchange(exchange, 'fanout', {
        durable: true,
        autoDelete: false
      });

      const publisher = new RabbitMQMessagePublisher(exchange, channel);
      return publisher;
    };
  });

diContainer
  .bind<ITruckRepository>(TYPES.ITruckRepository)
  .to(MongoDbTruckRepository);

diContainer
  .bind<ITruckService>(TYPES.ITruckService)
  .to(RepositoryAndMessageBrokerTruckService)
  .inSingletonScope();

export { diContainer };
