import { Container } from '../../domain/container';
import { Truck } from '../../domain/truck';

export interface ITruckRepository {
  /**
   * Finds a truck by a license plate
   * @param plate The license plate
   */
  findByLicensePlate(plate: string): Promise<Truck>;

  /**
   * Finds a truck by id
   * @param id The id to find
   */
  findById(id: string): Promise<Truck>;

  /**
   * Creates a new truck in the repository
   * @param truck The truck to create
   */
  create(truck: Truck): Promise<Truck>;

  /**
   * Updates the status of the truck
   * @param id The id to update
   * @param newStatus The new status of the truck
   */
  updateStatus(id: string, newStatus: number): Promise<Truck>;
}
