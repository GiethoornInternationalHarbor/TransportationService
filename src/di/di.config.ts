import { Container } from 'inversify';
import { ITruckService } from '../application/services/itruck.service';
import { IMessageHandler } from '../infrastructure/messaging/imessage.handler';
import { IMessagePublisher } from '../infrastructure/messaging/imessage.publisher';
import { MongoDbTruckRepository } from '../infrastructure/mongodb/mongodb.truck.repository';
import { RabbitMQChannel } from '../infrastructure/rabbitmq/rabbitmq.channel';
import { RabbitMQMessageHandler } from '../infrastructure/rabbitmq/rabbitmq.message.handler';
import { RabbitMQMessagePublisher } from '../infrastructure/rabbitmq/rabbitmq.message.publisher';
import { ITruckRepository } from '../infrastructure/repository/itruck.repository';
import { MessageBrokerHandlerTruckService } from '../infrastructure/services/messagebroker.handler.truck.service';
// tslint:disable-next-line:max-line-length
import { RepositoryAndMessageBrokerTruckService } from '../infrastructure/services/repository.messagebroker.truck.service';
import { TYPES } from './types';

const diContainer = new Container();

export type MessagePublisherProvider = (
  exchange: string
) => Promise<IMessagePublisher>;

export type MessageHandlerProvider = (
  exchange: string,
  queue: string
) => Promise<IMessageHandler>;

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

export { diContainer };
