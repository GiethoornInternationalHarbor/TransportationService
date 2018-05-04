import { inject, injectable, postConstruct } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { MessageHandlerProvider } from '../../di/di.config';
import { TYPES } from '../../di/types';
import { Truck } from '../../domain/truck';
import { IMessageHandler } from '../messaging/imessage.handler';
import { MessageType } from '../messaging/message.types';
import { RabbitMQExchange } from '../rabbitmq/rabbitmq.exchanges';
import { RabbitMQQueue } from '../rabbitmq/rabbitmq.queues';

@injectable()
export class MessageBrokerHandlerTruckService {
  private messageHandler: IMessageHandler;
  constructor(
    @inject(TYPES.MessageHandlerProvider)
    private messageHandlerProvider: MessageHandlerProvider,
    @inject(TYPES.ITruckService) private truckService: ITruckService
  ) {}

  @postConstruct()
  public async postInit() {
    this.messageHandler = await this.messageHandlerProvider(
      RabbitMQExchange.Default,
      RabbitMQQueue.Default
    );

    console.log('Starting message handling, (handling outstanding events)');
    await this.messageHandler.start(this.handleMessage);
    console.log('Message handling started, (new events)');
  }

  private async handleMessage(type: MessageType, body?: any) {
    switch (type) {
      case MessageType.ShipContainerLoaded:
        await this.handleShipContainerLoading(body);
        break;
      case MessageType.ShipContainerUnloaded: {
        await this.handleShipContainerUnloading(body);
        break;
      }
    }
  }

  private async handleShipContainerLoading(body?: any) {
    const truck = new Truck(body);

    if (truck.container == null) {
      // do not do anything
      return;
    }

    return this.truckService.containerLoaded(
      truck.licensePlate,
      truck.container
    );
  }

  private async handleShipContainerUnloading(body?: any) {
    const truck = new Truck(body);

    return this.truckService.containerUnloaded(truck.licensePlate);
  }
}
