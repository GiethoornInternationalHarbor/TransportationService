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
    return new Promise<void>((resolve, reject) => {
      const dataToSend = data ? JSON.stringify(data) : '';

      try {
        this.rabbitChannel.publish(this.exchange, '', Buffer.from(dataToSend), {
          contentType: 'application/json',
          type
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
