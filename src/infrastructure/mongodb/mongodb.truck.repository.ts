import { inject, injectable } from 'inversify';
import { Model, Schema } from 'mongoose';
import { TYPES } from '../../di/types';
import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';
import { TruckStatus } from '../../domain/truckStatus';
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

  public async create(truck: Truck): Promise<Truck> {
    const createdModel = await this.Model.create(truck);

    const createdTruck = mapModelToEntity<ITruckDocument, Truck>(
      createdModel,
      Truck
    );

    return createdTruck;
  }

  public async updateStatus(
    plate: string,
    newStatus: TruckStatus
  ): Promise<Truck> {
    const updatedModel = await this.Model.findOneAndUpdate(
      {
        licensePlate: plate
      },
      {
        status: newStatus
      },
      {
        new: true
      }
    );

    if (!updatedModel) {
      throw new Error('Plate not found in database');
    }

    const updatedTruck = mapModelToEntity<ITruckDocument, Truck>(
      updatedModel,
      Truck
    );

    return updatedTruck;
  }

  public async updateContainer(
    plate: string,
    container?: Container | undefined
  ): Promise<Truck> {
    const updateContent = container ? container : {};

    const updatedModel = await this.Model.findOneAndUpdate(
      {
        licensePlate: plate
      },
      { container: updateContent },
      {
        new: true
      }
    );

    if (!updatedModel) {
      throw new Error('Plate not found in database');
    }

    const updatedTruck = mapModelToEntity<ITruckDocument, Truck>(
      updatedModel,
      Truck
    );

    return updatedTruck;
  }
}
