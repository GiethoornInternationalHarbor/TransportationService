import { inject, injectable } from 'inversify';
import { Model, Schema } from 'mongoose';
import { TYPES } from '../../di/types';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { ITruckRepository } from '../repository/itruck.repository';
import { mapModelToEntity } from './helpers/mapper.helper';
import { ITruckDocument, TruckSchema } from './model/schema/truck.schema';
import { MongoDbClient } from './mongodb.client';

@injectable()
export class MongoDbTruckRepository implements ITruckRepository {
  protected Model: Model<ITruckDocument>;

  constructor(@inject(TYPES.MongoDbClient) dbClient: MongoDbClient) {
    this.Model = dbClient.model<ITruckDocument>('Truck', TruckSchema);
  }

  public async findByLicensePlate(plate: string): Promise<Truck> {
    const foundModel = await this.Model.findOne({
      licensePlate: plate
    });

    if (!foundModel) {
      throw new Error('License plate not found');
    }

    const correctTruck = mapModelToEntity<ITruckDocument, Truck>(
      foundModel,
      Truck
    );

    return correctTruck;
  }
  public findById(id: string): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
  public async create(truck: Truck): Promise<Truck> {
    const createdModel = await this.Model.create(truck);

    const createdTruck = mapModelToEntity<ITruckDocument, Truck>(
      createdModel,
      Truck
    );

    return createdTruck;
  }

  public updateStatus(id: string, newStatus: number): Promise<Truck> {
    throw new Error('Method not implemented.');
  }
}
