import { ContainerModule } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { TYPES } from '../../di/types';
import { IMessageHandler } from '../messaging/imessage.handler';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { getDatabaseClient } from '../mongodb/mongodb.client';
import { MongoDbTruckRepository } from '../mongodb/mongodb.truck.repository';
import { getRabbitMQChannel } from '../rabbitmq/rabbitmq.channel';
import { RabbitMQMessageHandler } from '../rabbitmq/rabbitmq.message.handler';
import { RabbitMQMessagePublisher } from '../rabbitmq/rabbitmq.message.publisher';
import { ITruckRepository } from '../repository/itruck.repository';
import { MessageBrokerHandlerTruckService } from '../services/messagebroker.handler.truck.service';
import { RepositoryAndMessageBrokerTruckService } from '../services/repository.messagebroker.truck.service';

/**
 * Provider for the IMessagePublisher interface
 */
export type MessagePublisherProvider = (
  exchange: string
) => Promise<IMessagePublisher>;

/**
 * Provider for the IMessageHandler interface
 */
export type MessageHandlerProvider = (
  exchange: string,
  queue: string
) => Promise<IMessageHandler>;

/**
 * Provider for the ITruckRepository interface
 */
export type TruckRepositoryProvider = () => Promise<ITruckRepository>;

export const InfrastructureContainerModule = new ContainerModule(bind => {
  bind<MessagePublisherProvider>(TYPES.MessagePublisherProvider).toProvider<
    IMessagePublisher
  >(context => {
    return async (exchange: string) => {
      const channel = await getRabbitMQChannel();

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

  bind<MessageHandlerProvider>(TYPES.MessageHandlerProvider).toProvider<
    IMessageHandler
  >(context => {
    return async (exchange: string, queue: string) => {
      const channel = await getRabbitMQChannel();

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

  bind<TruckRepositoryProvider>(TYPES.TruckRepositoryProvider).toProvider<
    ITruckRepository
  >(context => {
    return async () => {
      const dbClient = await getDatabaseClient();

      return new MongoDbTruckRepository(dbClient);
    };
  });

  bind<ITruckService>(TYPES.ITruckService).to(
    RepositoryAndMessageBrokerTruckService
  );

  bind(TYPES.MessageHandler)
    .to(MessageBrokerHandlerTruckService)
    .inSingletonScope();
});

export async function checkInfrastructureInitialization() {
  return Promise.all([getDatabaseClient(), getRabbitMQChannel()]);
}
