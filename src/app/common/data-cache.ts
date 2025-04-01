import {Observable, from} from 'rxjs';


export class DataCache<IdType, DataType> {
  private cache: Map<IdType, Promise<DataType>> = new Map();

  constructor(
    private loadFunction: (id: IdType) => Promise<DataType>
  ) {}

  /*
    Each call for the same id return a new observable backed by the same underlying promise.
  */
  get(id: IdType): Observable<DataType> {
    if (this.cache.has(id)) {
      return from(this.cache.get(id)!);
    }
    const promise: Promise<DataType> = this.loadFunction(id);
    this.cache.set(id, promise);
    return from(promise);
  }

  invalidate(id: IdType) {
    this.cache.delete(id);
  }
}
