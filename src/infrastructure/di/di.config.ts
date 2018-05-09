import { AsyncContainerModule } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { diContainer } from '../../di/di.config';
import { TYPES } from '../../di/types';
import { IMessageHandler } from '../messaging/imessage.handler';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { getDatabaseClient, MongoDbClient } from '../mongodb/mongodb.client';
import { MongoDbTruckRepository } from '../mongodb/mongodb.truck.repository';
import {
  getRabbitMQChannel,
  RabbitMQChannel
} from '../rabbitmq/rabbitmq.channel';
import { RabbitMQMessageHandler } from '../rabbitmq/rabbitmq.message.handler';
import { RabbitMQMessagePublisher } from '../rabbitmq/rabbitmq.message.publisher';
import { ITruckRepository } from '../repository/itruck.repository';
import { MessageBrokerHandlerTruckService } from '../services/messagebroker.handler.truck.service';
import { RepositoryAndMessageBrokerTruckService } from '../services/repository.messagebroker.truck.service';

export type MessagePublisherProvider = (
  exchange: string
) => Promise<IMessagePublisher>;

export type MessageHandlerProvider = (
  exchange: string,
  queue: string
) => Promise<IMessageHandler>;

export const InfrastructureContainerModule = new AsyncContainerModule(
  async bind => {
    const [dbClient, rabbitMqClient] = await Promise.all([
      getDatabaseClient(),
      getRabbitMQChannel()
    ]);

    // Add the db to the di container
    diContainer
      .bind<MongoDbClient>(TYPES.MongoDbClient)
      .toConstantValue(dbClient);
    diContainer
      .bind<RabbitMQChannel>(TYPES.RabbitMQChannel)
      .toConstantValue(rabbitMqClient);

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
      .bind<MessageHandlerProvider>(TYPES.MessageHandlerProvider)
      .toProvider<IMessageHandler>(context => {
        return async (exchange: string, queue: string) => {
          const channel = context.container.get<RabbitMQChannel>(
            TYPES.RabbitMQChannel
          );

          // We have the connection and channel now
          // Need to assert the exchange (this ensures the exchange exists)
          await channel.assertExchange(exchange, 'fanout', {
            durable: true,
            autoDelete: false
          });

          await channel.assertQueue(queue);
          await channel.bindQueue(queue, exchange, '');

          const handler = new RabbitMQMessageHandler(queue, channel);
          return handler;
        };
      });

    diContainer
      .bind<ITruckRepository>(TYPES.ITruckRepository)
      .to(MongoDbTruckRepository);

    diContainer
      .bind<ITruckService>(TYPES.ITruckService)
      .to(RepositoryAndMessageBrokerTruckService)
      .inSingletonScope();

    diContainer
      .bind(TYPES.MessageHandler)
      .to(MessageBrokerHandlerTruckService)
      .inSingletonScope();
  }
);
