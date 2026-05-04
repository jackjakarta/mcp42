export type UpdateDbRow<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>;
