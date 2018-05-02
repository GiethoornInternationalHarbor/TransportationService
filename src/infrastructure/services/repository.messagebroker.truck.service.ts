import { inject, injectable, postConstruct } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { MessagePublisherProvider } from '../../di/di.config';
import { TYPES } from '../../di/types';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { TruckStatus } from '../../domain/truckStatus';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { RabbitMQExchange } from '../rabbitmq/rabbitmq.exchanges';
import { ITruckRepository } from '../repository/itruck.repository';

@injectable()
export class RepositoryAndMessageBrokerTruckService implements ITruckService {
  private messagePublisher: IMessagePublisher;

  constructor(
    @inject(TYPES.ITruckRepository) private truckRepository: ITruckRepository,
    @inject(TYPES.MessagePublisherProvider)
    private messagePublisherProvider: MessagePublisherProvider
  ) {}

  @postConstruct()
  public async postInit() {
    this.messagePublisher = await this.messagePublisherProvider(
      RabbitMQExchange.Default
    );
  }

  public async arrive(body: any): Promise<Truck> {
    const arrivingTruck = new Truck(body);

    // Ensure the status is arriving
    arrivingTruck.status = TruckStatus.ARRIVING;

    // Save it in the repository, since we are sure it is valid now
    const createdTruck = await this.truckRepository.create(arrivingTruck);

    // Also publish it as an message
    await this.messagePublisher.publishMessage(
      'TruckArrivingEvent',
      createdTruck
    );

    return createdTruck;
  }

  public depart(body: any): Promise<Truck> {
    throw new Error('Method not implemented.');
  }

  public arrived(licensePlate: string): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
}
