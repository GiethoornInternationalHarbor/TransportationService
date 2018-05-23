import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';

export interface ITruckService {
  /**
   * Gets an overview of all the trucks at the harbor or arriving/departing
   */
  getOverview(): Promise<Truck[]>;

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

  /**
   * Handles when an departing truck is cleared
   * @param licensePlate The license plate of the truck
   */
  departed(licensePlate: string): Promise<Truck>;

  /**
   * Handles loading the container
   * @param licensePlate The plate of the truck
   * @param container The container loaded on the truck
   */
  containerLoaded(licensePlate: string, container: Container): Promise<Truck>;

  /**
   * Handles unloading the container
   * @param licensePlate The plate of the truck
   */
  containerUnloaded(licensePlate: string): Promise<Truck>;

  /**
   * Handles when the truck is cleared by security
   * @param licensePlate The plate of the truck
   */
  cleared(licensePlate: string): Promise<Truck>;
}
