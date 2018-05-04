const TYPES = {
  App: Symbol.for('APP'),
  ITruckService: Symbol.for('ITruckService'),
  MessagePublisherProvider: Symbol.for('MessagePublisherProvider'),
  MessageHandlerProvider: Symbol.for('MessageHandlerProvider'),
  ITruckRepository: Symbol.for('ITruckRepository'),
  MongoDbClient: Symbol.for('MongoDbClient'),
  RabbitMQChannel: Symbol.for('RabbitMQChannel'),
  MessageHandler: Symbol.for('MessageHandler')
};

export { TYPES };
