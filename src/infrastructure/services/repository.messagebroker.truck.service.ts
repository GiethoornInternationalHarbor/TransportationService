import { inject, injectable, postConstruct } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { TYPES } from '../../di/types';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { TruckStatus } from '../../domain/truckStatus';
import { MessagePublisherProvider } from '../di/di.config';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { MessageType } from '../messaging/message.types';
import { RabbitMQExchange } from '../rabbitmq/rabbitmq.exchanges';
import { ITruckRepository } from '../repository/itruck.repository';

@injectable()
export class RepositoryAndMessageBrokerTruckService implements ITruckService {
  constructor(
    @inject(TYPES.ITruckRepository) private truckRepository: ITruckRepository,
    @inject(TYPES.MessagePublisherProvider)
    private messagePublisherProvider: MessagePublisherProvider
  ) {}

  public async arrive(body: any): Promise<Truck> {
    const arrivingTruck = new Truck(body);

    // Ensure the status is arriving
    arrivingTruck.status = TruckStatus.ARRIVING;

    // Save it in the repository, since we are sure it is valid now
    const createdTruck = await this.truckRepository.create(arrivingTruck);

    // Also publish it as an message
    const messagePublisher = await this.getMessagePublisher();
    await messagePublisher.publishMessage(
      MessageType.TruckArriving,
      createdTruck
    );

    return createdTruck;
  }

  public async depart(body: any): Promise<Truck> {
    const departingTruck = new Truck(body);

    // Update the status of the truck
    let updatedTruck = await this.truckRepository.updateStatus(
      departingTruck.licensePlate,
      TruckStatus.DEPARTING
    );

    // Update the container
    updatedTruck = await this.truckRepository.updateContainer(
      departingTruck.licensePlate,
      departingTruck.container
    );

    // Now publish it as an message
    const messagePublisher = await this.getMessagePublisher();
    await messagePublisher.publishMessage(
      MessageType.TruckDeparting,
      updatedTruck
    );

    return updatedTruck;
  }

  public async arrived(licensePlate: string): Promise<Truck> {
    // Update the status of the truck
    const updatedTruck = await this.truckRepository.updateStatus(
      licensePlate,
      TruckStatus.ARRIVED
    );

    // Now publish it as an message
    const messagePublisher = await this.getMessagePublisher();
    await messagePublisher.publishMessage(
      MessageType.TruckArrived,
      updatedTruck
    );

    return updatedTruck;
  }

  public async departed(licensePlate: string): Promise<Truck> {
    // Update the status of the truck
    const updatedTruck = await this.truckRepository.updateStatus(
      licensePlate,
      TruckStatus.DEPARTED
    );

    // Now publish it as an message
    const messagePublisher = await this.getMessagePublisher();
    await messagePublisher.publishMessage(
      MessageType.TruckDeparted,
      updatedTruck
    );

    return updatedTruck;
  }

  public async containerLoaded(
    licensePlate: string,
    container: Container
  ): Promise<Truck> {
    return this.truckRepository.updateContainer(licensePlate, container);
  }

  public async containerUnloaded(licensePlate: string): Promise<Truck> {
    return this.truckRepository.updateContainer(licensePlate);
  }

  public async cleared(licensePlate: string): Promise<Truck> {
    // First we need to find the truck
    let truck = await this.truckRepository.findByLicensePlate(licensePlate);

    if (truck.status === TruckStatus.ARRIVING) {
      truck = await this.arrived(licensePlate);
    } else if (truck.status === TruckStatus.DEPARTING) {
      truck = await this.departed(licensePlate);
    }

    return truck;
  }

  /**
   * Gets the message publisher
   */
  private async getMessagePublisher() {
    const t = await this.messagePublisherProvider(RabbitMQExchange.Default);
    return t;
  }
}
