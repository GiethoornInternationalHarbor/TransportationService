import { MessageType } from './message.types';

export interface IMessagePublisher {
  /**
   * Publishes a message
   * @param type The type of message to publish
   * @param data The data of the message
   */
  publishMessage(type: MessageType, data?: object): Promise<void>;
}
