export interface BasicRepository<TEntity, TCreate, TUpdate, TListQuery> {
	create(input: TCreate): Promise<TEntity>;
	findById(id: string): Promise<TEntity | null>;
	findAll(query: TListQuery): Promise<{ items: TEntity[]; total: number }>;
	update(id: string, input: TUpdate): Promise<TEntity | null>;
	delete(id: string): Promise<boolean>;
}

export type BasicRepo<TEntity, TCreate, TUpdate, TListQuery> = BasicRepository<
	TEntity,
	TCreate,
	TUpdate,
	TListQuery
>;
