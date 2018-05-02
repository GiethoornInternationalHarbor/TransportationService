import amqplib from 'amqplib';
import retry from 'async-retry';

export type RabbitMQChannel = amqplib.Channel;

/**
 * Gets a AMQP channel to communicate through
 * @param ex The exchange to assert
 */
export async function getRabbitMQChannel(
  ex: string = 'GiethoornInternational'
): Promise<RabbitMQChannel> {
  const envAmqpUrl = process.env.AMQP_URL;

  if (!envAmqpUrl) {
    throw new Error('No AMQP URL was provided');
  }

  return await retry(
    async () => {
      const connection = await amqplib.connect(envAmqpUrl);
      const channel = await connection.createChannel();

      // We have the connection and channel now
      // Need to assert the exchange (this ensures the exchange exists)
      await channel.assertExchange(ex, 'fanout', {
        durable: true,
        autoDelete: false
      });

      console.log('AMQP connection success');

      return channel;
    },
    {
      factor: 1,
      onRetry: err => {
        console.warn('Retrying to connnect to AMQP', err);
      }
    }
  );
}
