import { inject, injectable } from 'inversify';
import { TYPES } from '../../di/types';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { RabbitMQChannel } from './rabbitmq.channel';

@injectable()
export class RabbitMQMessagePublisher implements IMessagePublisher {
  constructor(
    private exchange: string,
    private rabbitChannel: RabbitMQChannel
  ) {}

  public publishMessage(
    type: string,
    data?: object | undefined
  ): Promise<void> {
    const dataToSend = data ? JSON.stringify(data) : '';

    this.rabbitChannel.publish(this.exchange, '', Buffer.from(dataToSend), {
      contentType: 'application/json',
      type
    });

    throw new Error('Method not implemented.');
  }
}
