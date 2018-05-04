/**
 * Interface which allows a type as parameter of the function, which can be newed.
 */
export interface INewable<T> {
  new (data?: any): T;
}
