import amqplib from 'amqplib';
import retry from 'async-retry';

export type RabbitMQChannel = amqplib.Channel;

/**
 * Gets a AMQP channel to communicate through
 * @param ex The exchange to assert
 */
export async function getRabbitMQChannel(): Promise<RabbitMQChannel> {
  const envAmqpUrl = process.env.AMQP_URL;

  if (!envAmqpUrl) {
    throw new Error('No AMQP URL was provided');
  }

  return retry(
    async () => {
      const connection = await amqplib.connect(envAmqpUrl);
      const channel = await connection.createChannel();

      console.log('AMQP connection success');

      return channel;
    },
    {
      factor: 1,
      onRetry: err => {
        console.warn('Retrying to connect to AMQP', err);
      }
    }
  );
}
