import { use as chaiUse } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import express from 'express';
import 'mocha';
import supertest from 'supertest';
import * as TypeMoq from 'typemoq';
import { diContainer } from '../../../src/di/di.config';
// tslint:disable-next-line:ordered-imports
import { bootstrap } from '../../../src/di/bootstrap';
import { TYPES } from '../../../src/di/types';
import { Truck } from '../../../src/domain/truck';
import { TruckStatus } from '../../../src/domain/truckStatus';
import { TruckRepositoryProvider } from '../../../src/infrastructure/di/di.config';
import { IMessagePublisher } from '../../../src/infrastructure/messaging/imessage.publisher';
import { MessageType } from '../../../src/infrastructure/messaging/message.types';
import { ITruckRepository } from '../../../src/infrastructure/repository/itruck.repository';
import { MockTruckRepository } from '../repostory-and-messagebroker/mock.truck.repository';
chaiUse(chaiAsPromised);

describe('API Truck Tests', () => {
  before(() => {
    bootstrap(diContainer);
  });

  let mockedMessagePublisher: TypeMoq.IMock<IMessagePublisher>;
  beforeEach(async () => {
    // Make a snapshot before applying changes
    diContainer.snapshot();

    const mockedTruckRepo = new MockTruckRepository();
    diContainer
      .rebind(TYPES.TruckRepositoryProvider)
      .toProvider<ITruckRepository>(context => () =>
        Promise.resolve(mockedTruckRepo)
      );

    // Mock the message handler
    mockedMessagePublisher = TypeMoq.Mock.ofType<IMessagePublisher>();
    // Setup .then handler because we need to be able to handle promises
    mockedMessagePublisher.setup((x: any) => x.then).returns(() => undefined);
    mockedMessagePublisher
      .setup(x =>
        x.publishMessage(TypeMoq.It.isAnyNumber(), TypeMoq.It.isAny())
      )
      .returns(() => Promise.resolve());

    diContainer
      .rebind(TYPES.MessagePublisherProvider)
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

  it('Returns a 400 when data without a license plate is send to /api/truck/arrive', async () => {
    // First get the app out of our diContainer
    const expressApp = diContainer.get<express.Application>(TYPES.App);

    const body = {
      container: {
        product: {
          name: 'Ca324',
          type: '46'
        },
        number: '123'
      }
    };

    const response = await supertest(expressApp)
      .post('/api/truck/arrive')
      .send(body)
      .expect(400);
  });

  it('Returns a 400 when data without a license plate is send to /api/truck/depart', async () => {
    // First get the app out of our diContainer
    const expressApp = diContainer.get<express.Application>(TYPES.App);

    const body = {
      container: {
        product: {
          name: 'Ca324',
          type: '46'
        },
        number: '123'
      }
    };

    const response = await supertest(expressApp)
      .post('/api/truck/depart')
      .send(body)
      .expect(400);
  });

  it('Broadcasts a TruckArrivingEvent when a call with license plate is send to /api/truck/arrive', async () => {
    const expressApp = diContainer.get<express.Application>(TYPES.App);

    const body = {
      licensePlate: 'AB-CD-12'
    };

    const response = await supertest(expressApp)
      .post('/api/truck/arrive')
      .send(body)
      .expect(201);

    await mockedMessagePublisher.verify(
      x =>
        x.publishMessage(
          TypeMoq.It.isValue(MessageType.TruckArriving),
          TypeMoq.It.isObjectWith<Truck>(body)
        ),
      TypeMoq.Times.once()
    );
  });

  it('Broadcasts a TruckDepartingEvent when a call with license plate is send to /api/truck/depart', async () => {
    const expressApp = diContainer.get<express.Application>(TYPES.App);

    const body = {
      licensePlate: 'AB-CD-12'
    };

    // Ensure the truck is created else we can't depart
    const truckRepositoryProvider = diContainer.get<TruckRepositoryProvider>(
      TYPES.TruckRepositoryProvider
    );

    const truckRepository = await truckRepositoryProvider();
    await truckRepository.create(new Truck(body));
    await truckRepository.updateStatus(body.licensePlate, TruckStatus.ARRIVED);

    const response = await supertest(expressApp)
      .post('/api/truck/depart')
      .send(body)
      .expect(200);

    await mockedMessagePublisher.verify(
      x =>
        x.publishMessage(
          TypeMoq.It.isValue(MessageType.TruckDeparting),
          TypeMoq.It.isObjectWith<Truck>(body)
        ),
      TypeMoq.Times.once()
    );
  });
});
