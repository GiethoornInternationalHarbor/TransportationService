import { injectable } from 'inversify';
import { IMessagePublisher } from '../messaging/imessage.publisher';

@injectable()
export class RabbitMQMessagePublisher implements IMessagePublisher {
  public publishMessage(
    type: string,
    data?: object | undefined
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
