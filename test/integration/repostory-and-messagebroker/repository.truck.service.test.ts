import { Container } from "inversify";
import { InfrastructureContainerModule } from '../../../src/infrastructure/di/di.config';
import { TYPES } from "../../../src/di/types";
import { MockTruckRepository } from './mock.truck.repository';
import { IMessageHandler } from "../../../src/infrastructure/messaging/imessage.handler";
import * as TypeMoq from "typemoq";

describe('Repository Truck Service Tests', () => {
    let diContainer: Container;

    beforeEach(async () => {
        await diContainer.loadAsync(InfrastructureContainerModule);

        diContainer.unbind(TYPES.ITruckRepository);
        diContainer.bind(TYPES.ITruckRepository).to(MockTruckRepository);

        // Mock the message handler
        const myServiceMock: IMessageHandler = TypeMoq.Mock.ofType()
    });
});