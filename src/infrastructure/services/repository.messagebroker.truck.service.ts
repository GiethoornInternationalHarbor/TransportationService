import { inject, injectable } from 'inversify';
import { ITruckService } from '../../application/services/itruck.service';
import { TYPES } from '../../di/types';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { TruckStatus } from '../../domain/truckStatus';
import { IMessagePublisher } from '../messaging/imessage.publisher';
import { ITruckRepository } from '../repository/itruck.repository';

@injectable()
export class RepositoryAndMessageBrokerTruckService implements ITruckService {
  constructor(
    @inject(TYPES.ITruckRepository) private truckRepository: ITruckRepository,
    @inject(TYPES.IMessagePublisher) private messagePublisher: IMessagePublisher
  ) {}

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
