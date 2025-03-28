export type OrderBy<T> = { [P in keyof T]?: 'asc' | 'desc' };
