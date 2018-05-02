import { Document } from 'mongoose';
import { Model } from 'objectmodel';
import { INewable } from './inewable.interface';

export function mapModelToEntity<TModel extends Document, TEntity>(
  model: TModel,
  resultingType: INewable<TEntity>
) {
  const obj: any = model.toJSON();

  return new resultingType(obj);
}
