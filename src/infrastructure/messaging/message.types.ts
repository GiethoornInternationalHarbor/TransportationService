export enum MessageType {
  Unknown,
  TruckArriving,
  TruckDeparting,
  TruckArrived,
  TruckDeparted,
  TruckCleared,
  ShipContainerLoaded,
  ShipContainerUnloaded
}

// tslint:disable-next-line:no-namespace
export namespace MessageType {
  export function toString(type: MessageType) {
    return messageTypeName.get(type);
  }

  export function parse(type: string): MessageType {
    for (const iterator of messageTypeName.entries()) {
      if (iterator['1'] === type) {
        return iterator['0'];
      }
    }

    return MessageType.Unknown;
  }
}

const messageTypeName = new Map<MessageType, string>([
  [MessageType.TruckArriving, 'TruckArriving'],
  [MessageType.TruckDeparting, 'TruckDeparting'],
  [MessageType.TruckArrived, 'TruckArrived'],
  [MessageType.TruckDeparted, 'TruckDeparted'],
  [MessageType.TruckCleared, 'TruckCleared'],
  [MessageType.ShipContainerLoaded, 'ShipContainerLoaded'],
  [MessageType.ShipContainerUnloaded, 'ShipContainerUnloaded']
]);
