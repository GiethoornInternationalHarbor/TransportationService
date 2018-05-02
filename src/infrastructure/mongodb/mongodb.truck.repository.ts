import { injectable } from 'inversify';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { ITruckRepository } from '../repository/itruck.repository';

@injectable()
export class MongoDbTruckRepository implements ITruckRepository {
  public findByLicensePlate(plate: string): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
  public findById(id: string): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
  public create(truck: Truck): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
  public updateStatus(id: string, newStatus: number): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
}
