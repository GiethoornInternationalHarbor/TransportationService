import { injectable } from 'inversify';
import { Container } from '../../../src/domain/container';
import { Truck } from '../../../src/domain/truck';
import { TruckStatus } from '../../../src/domain/truckStatus';
import { ITruckRepository } from '../../../src/infrastructure/repository/itruck.repository';

@injectable()
export class MockTruckRepository implements ITruckRepository {
  private trucks: Truck[] = [];

  public async create(truck: Truck): Promise<Truck> {
    this.trucks.push(truck);
    return truck;
  }
  public async updateContainer(
    plate: string,
    container?: Container
  ): Promise<Truck> {
    const truck = await this.findByLicensePlate(plate);
    truck.container = container;

    return truck;
  }

  public async updateStatus(
    plate: string,
    newStatus: TruckStatus
  ): Promise<Truck> {
    const truck = await this.findByLicensePlate(plate);
    truck.status = newStatus;

    return truck;
  }

  public async findByLicensePlate(plate: string): Promise<Truck> {
    const index = this.trucks.findIndex(x => x.licensePlate === plate);

    return this.trucks[index];
  }

  public async exists(plate: string): Promise<boolean> {
    return this.trucks.findIndex(x => x.licensePlate === plate) > -1;
  }
}
