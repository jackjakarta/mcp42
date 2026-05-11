import { sql, type AnyColumn, type SQL } from 'drizzle-orm';

export function jsonArrayContains(column: AnyColumn, value: string): SQL {
  return sql`EXISTS (SELECT 1 FROM json_each(${column}) WHERE value = ${value})`;
}
