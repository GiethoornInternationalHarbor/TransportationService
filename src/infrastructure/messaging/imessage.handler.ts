import { MessageType } from './message.types';

export interface IMessageHandler {
  /**
   *
   * @param onMessage The handler when a message is received
   */
  start(onMessage: IMessageReceivedCallback): Promise<any>;
}

export type IMessageReceivedCallback = (
  type: MessageType,
  body?: any
) => Promise<void>;
