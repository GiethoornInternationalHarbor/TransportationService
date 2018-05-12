import { inject, injectable } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { TYPES } from '../../di/types';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { TruckStatus } from '../../domain/truckStatus';
import {
  MessagePublisherProvider,
  TruckRepositoryProvider
} from '../di/di.config';
import { MessageType } from '../messaging/message.types';
import { RabbitMQExchange } from '../rabbitmq/rabbitmq.exchanges';

@injectable()
export class RepositoryAndMessageBrokerTruckService implements ITruckService {
  constructor(
    @inject(TYPES.TruckRepositoryProvider)
    private readonly truckRepositoryProvider: TruckRepositoryProvider,
    @inject(TYPES.MessagePublisherProvider)
    private readonly messagePublisherProvider: MessagePublisherProvider
  ) {}

  public async arrive(body: any): Promise<Truck> {
    const truckRepo = await this.getTruckRepository();

    const arrivingTruck = new Truck(body);

    // Ensure the status is arriving
    arrivingTruck.status = TruckStatus.ARRIVING;

    // Check if we do not already have an truck with the same id
    const truckExists = await truckRepo.exists(arrivingTruck.licensePlate);

    if (truckExists) {
      throw new Error('Truck is already at the harbor');
    }

    // Save it in the repository, since we are sure it is valid now
    const createdTruck = await truckRepo.create(arrivingTruck);

    // Also publish it as an message
    const messagePublisher = await this.getMessagePublisher();
    await messagePublisher.publishMessage(
      MessageType.TruckArriving,
      createdTruck
    );

    return createdTruck;
  }

  public async depart(body: any): Promise<Truck> {
    const truckRepo = await this.getTruckRepository();

    const departingTruck = new Truck(body);

    // Update the status of the truck
    let updatedTruck = await truckRepo.updateStatus(
      departingTruck.licensePlate,
      TruckStatus.DEPARTING
    );

    // Update the container
    updatedTruck = await truckRepo.updateContainer(
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
    const truckRepo = await this.getTruckRepository();

    // Update the status of the truck
    const updatedTruck = await truckRepo.updateStatus(
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
    const truckRepo = await this.getTruckRepository();

    // Remove the truck from the repository since it is not at the harbor anymore
    const removedTruck = await truckRepo.removeTruck(licensePlate);

    // Now publish it as an message
    const messagePublisher = await this.getMessagePublisher();
    await messagePublisher.publishMessage(
      MessageType.TruckDeparted,
      removedTruck
    );

    return removedTruck;
  }

  public async containerLoaded(
    licensePlate: string,
    container: Container
  ): Promise<Truck> {
    const truckRepo = await this.getTruckRepository();

    return truckRepo.updateContainer(licensePlate, container);
  }

  public async containerUnloaded(licensePlate: string): Promise<Truck> {
    const truckRepo = await this.getTruckRepository();

    return truckRepo.updateContainer(licensePlate);
  }

  public async cleared(licensePlate: string): Promise<Truck> {
    const truckRepo = await this.getTruckRepository();

    // First we need to find the truck
    let truck = await truckRepo.findByLicensePlate(licensePlate);

    if (truck.status === TruckStatus.ARRIVING) {
      truck = await this.arrived(licensePlate);
    } else if (truck.status === TruckStatus.DEPARTING) {
      truck = await this.departed(licensePlate);
    }

    return truck;
  }

  /**
   * Gets the truck repository
   */
  private async getTruckRepository() {
    const t = await this.truckRepositoryProvider();
    return t;
  }

  /**
   * Gets the message publisher
   */
  private async getMessagePublisher() {
    const t = await this.messagePublisherProvider(RabbitMQExchange.Default);
    return t;
  }
}
