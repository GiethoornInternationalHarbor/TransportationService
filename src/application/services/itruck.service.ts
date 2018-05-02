import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';

export interface ITruckService {
  /**
   * Handles incoming trucks
   * @param body The incoming data
   */
  arrive(body: any): Promise<Truck>;

  /**
   * Handles departing trucks
   * @param body The incoming data
   */
  depart(body: any): Promise<Truck>;

  /**
   * Handles when an arriving truck is cleared
   * @param licensePlate The license plate of the truck
   */
  arrived(licensePlate: string): Promise<Truck>;
}
