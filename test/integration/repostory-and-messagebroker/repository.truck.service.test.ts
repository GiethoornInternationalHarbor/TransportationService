import { assert, use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import 'mocha';
import * as TypeMoq from 'typemoq';
import { ITruckService } from '../../../src/application/services/itruck.service';
import { diContainer } from '../../../src/di/di.config';
import { TYPES } from '../../../src/di/types';
import { Truck } from '../../../src/domain/truck';
import { TruckStatus } from '../../../src/domain/truckStatus';
import {
  InfrastructureContainerModule,
  TruckRepositoryProvider
} from '../../../src/infrastructure/di/di.config';
import { IMessagePublisher } from '../../../src/infrastructure/messaging/imessage.publisher';
import { MessageType } from '../../../src/infrastructure/messaging/message.types';
import { ITruckRepository } from '../../../src/infrastructure/repository/itruck.repository';
import { MockTruckRepository } from './mock.truck.repository';

chaiUse(chaiAsPromised);

describe('Repository Truck Service Tests', () => {
  before(() => {
    diContainer.load(InfrastructureContainerModule);
  });

  let mockedMessagePublisher: TypeMoq.IMock<IMessagePublisher>;
  beforeEach(async () => {
    // Make a snapshot before applying changes
    diContainer.snapshot();

    const mockedTruckRepo = new MockTruckRepository();
    diContainer.unbind(TYPES.TruckRepositoryProvider);
    diContainer
      .bind(TYPES.TruckRepositoryProvider)
      .toProvider<ITruckRepository>(context => () =>
        Promise.resolve(mockedTruckRepo)
      );

    // Mock the message handler
    mockedMessagePublisher = TypeMoq.Mock.ofType();
    // Setup .then handler because we need to be able to handle promises
    mockedMessagePublisher.setup((x: any) => x.then).returns(() => undefined);
    mockedMessagePublisher
      .setup(x =>
        x.publishMessage(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny())
      )
      .returns(() => Promise.resolve());

    diContainer.unbind(TYPES.MessagePublisherProvider);
    diContainer
      .bind(TYPES.MessagePublisherProvider)
      .toProvider<IMessagePublisher>(context => {
        return (exchange: string, queue: string) => {
          return new Promise(resolve => {
            resolve(mockedMessagePublisher.object);
          });
        };
      });
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
    await assert.isFulfilled(truckService.arrive(truck));

    // This should break
    await assert.isRejected(truckService.arrive(truck));
  });

  it('A truck with the same license plate can be arriving when it has departed before', async () => {
    const truckService: ITruckService = diContainer.get(TYPES.ITruckService);

    const truck = {
      licensePlate: 'test plate'
    };

    // First we arrive
    await assert.isFulfilled(truckService.arrive(truck));

    // Next we ensure we are arrived
    await assert.isFulfilled(truckService.arrived(truck.licensePlate));

    // Now we are departing and departed
    await assert.isFulfilled(truckService.depart(truck));

    // We are fully departed now
    await assert.isFulfilled(truckService.departed(truck.licensePlate));

    // We should now be able to arrive again with the same license plate
    await assert.isFulfilled(truckService.arrive(truck));
  });

  it('A message is broadcasted when an arriving truck is cleared', async () => {
    const truckService: ITruckService = diContainer.get(TYPES.ITruckService);

    const truckRepositoryProvider = diContainer.get<TruckRepositoryProvider>(
      TYPES.TruckRepositoryProvider
    );

    const truckRepository = await truckRepositoryProvider();

    const truck = {
      licensePlate: 'test plate'
    };

    // First we arrive
    await assert.isFulfilled(truckService.arrive(truck));

    // Now we have been cleared
    await assert.isFulfilled(truckService.cleared(truck.licensePlate));

    // Check if the status is updated
    const updatedTruck = await truckRepository.findByLicensePlate(
      truck.licensePlate
    );
    assert.strictEqual(updatedTruck.status, TruckStatus.ARRIVED);

    // Also check if the arrived event has been sent
    await mockedMessagePublisher.verify(
      x =>
        x.publishMessage(
          TypeMoq.It.isValue(MessageType.TruckArrived),
          TypeMoq.It.isObjectWith<Truck>(truck)
        ),
      TypeMoq.Times.once()
    );
  });

  it('A message is broadcasted when a departing truck is cleared', async () => {
    const truckService: ITruckService = diContainer.get(TYPES.ITruckService);

    const truckRepositoryProvider = diContainer.get<TruckRepositoryProvider>(
      TYPES.TruckRepositoryProvider
    );

    const truckRepository = await truckRepositoryProvider();

    const truck = {
      licensePlate: 'test plate'
    };

    // First we arrive
    await assert.isFulfilled(truckService.arrive(truck));

    // Now we have been cleared
    await assert.isFulfilled(truckService.cleared(truck.licensePlate));

    // Now we depart again
    await assert.isFulfilled(truckService.depart(truck));

    // Now we have been cleared and fully departed if correct
    await assert.isFulfilled(truckService.cleared(truck.licensePlate));

    // Check if the status is updated
    const updatedTruck = await truckRepository.findByLicensePlate(
      truck.licensePlate
    );

    // Since the truck should not be in the repository anymore, assert on undefined
    assert.isUndefined(updatedTruck);

    // Also check if the departed event has been sent
    await mockedMessagePublisher.verify(
      x =>
        x.publishMessage(
          TypeMoq.It.isValue(MessageType.TruckDeparted),
          TypeMoq.It.isObjectWith<Truck>(truck)
        ),
      TypeMoq.Times.once()
    );
  });
});
