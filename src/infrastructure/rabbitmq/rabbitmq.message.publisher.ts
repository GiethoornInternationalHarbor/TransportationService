import { injectable } from 'inversify';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { MessageType } from '../messaging/message.types';
import { RabbitMQChannel } from './rabbitmq.channel';

@injectable()
export class RabbitMQMessagePublisher implements IMessagePublisher {
  constructor(
    private readonly exchange: string,
    private readonly rabbitChannel: RabbitMQChannel
  ) {}

  public publishMessage(
    type: MessageType,
    data?: object | undefined
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (type === MessageType.Unknown) {
        reject(new Error("Unable to handle 'Unknown' message type"));
        return;
      }

      const dataToSend = data ? JSON.stringify(data) : '';

      try {
        this.rabbitChannel.publish(this.exchange, '', Buffer.from(dataToSend), {
          contentType: 'application/json',
          type: MessageType.toString(type)
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }
}
