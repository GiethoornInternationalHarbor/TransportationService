import { assert, expect, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Container } from 'inversify';
import 'mocha';
import { IMessagePublisher } from 'src/infrastructure/messaging/imessage.publisher';
import * as TypeMoq from 'typemoq';
import { ITruckService } from '../../../src/application/services/itruck.service';
import { diContainer } from '../../../src/di/di.config';
import { TYPES } from '../../../src/di/types';
import { InfrastructureContainerModule } from '../../../src/infrastructure/di/di.config';
// tslint:disable-next-line:max-line-length
import { RepositoryAndMessageBrokerTruckService } from '../../../src/infrastructure/services/repository.messagebroker.truck.service';
import { MockTruckRepository } from './mock.truck.repository';

chaiUse(chaiAsPromised);

describe('Repository Truck Service Tests', () => {
  beforeEach(async () => {
    // Make a snapshot before applying changes
    diContainer.snapshot();

    diContainer.bind(TYPES.ITruckRepository).to(MockTruckRepository);

    // Mock the message handler
    const mock: TypeMoq.IMock<IMessagePublisher> = TypeMoq.Mock.ofType();
    // Setup .then handler because we need to be able to handle promises
    mock.setup((x: any) => x.then).returns(() => undefined);
    mock.setup(x => x.publishMessage).returns(() => {
      return (x, y) => Promise.resolve();
    });

    diContainer
      .bind(TYPES.MessagePublisherProvider)
      .toProvider<IMessagePublisher>(context => {
        return (exchange: string, queue: string) => {
          return new Promise(resolve => {
            resolve(mock.object);
          });
        };
      });

    diContainer
      .bind<ITruckService>(TYPES.ITruckService)
      .to(RepositoryAndMessageBrokerTruckService)
      .inSingletonScope();
  });

  afterEach(() => {
    diContainer.restore();
  });

  it('No duplicate trucks can be arriving', async () => {
    // Get the service
    const truckService: ITruckService = diContainer.get(TYPES.ITruckService);

    const truck = {
      licensePlate: 'test plate'
    };

    // Initial arrive should work
    await truckService.arrive(truck);

    // This should break
    await assert.isRejected(truckService.arrive(truck));
  });

  it('A truck with the same license plate can be arriving when it has departed before', async () => {
    const truckService: ITruckService = diContainer.get(TYPES.ITruckService);

    const truck = {
      licensePlate: 'test plate'
    };

    // First we arrive
    await truckService.arrive(truck);

    // Next we ensure we are arrived
    await truckService.arrived(truck.licensePlate);

    // Now we are departing and departed
    await truckService.depart(truck);

    // We are fully departed now
    await truckService.departed(truck.licensePlate);

    // We should now be able to arrive again with the same license plate
    await assert.isFulfilled(truckService.arrive(truck));
  });
});
