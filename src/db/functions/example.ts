import { eq } from 'drizzle-orm';

import { db } from '../index.js';
import {
  exampleTable,
  InsertExampleModel,
  UpdateExampleModel,
  type ExampleModel,
} from '../schema/app.js';

export async function dbGetExamples(): Promise<ExampleModel[]> {
  const examples = await db.select().from(exampleTable);

  return examples;
}

export async function dbGetExampleById({
  exampleId,
}: {
  exampleId: string;
}): Promise<ExampleModel | undefined> {
  const [example] = await db.select().from(exampleTable).where(eq(exampleTable.id, exampleId));

  return example;
}

export async function dbInsertExample(data: InsertExampleModel): Promise<ExampleModel | undefined> {
  const [inserted] = await db.insert(exampleTable).values(data).returning();

  return inserted;
}

export async function dbUpdateExample({
  exampleId,
  data,
}: {
  exampleId: string;
  data: UpdateExampleModel;
}): Promise<ExampleModel | undefined> {
  const [updated] = await db
    .update(exampleTable)
    .set(data)
    .where(eq(exampleTable.id, exampleId))
    .returning();

  return updated;
}

export async function dbDeleteExample({
  exampleId,
}: {
  exampleId: string;
}): Promise<ExampleModel | undefined> {
  const [deleted] = await db.delete(exampleTable).where(eq(exampleTable.id, exampleId)).returning();

  return deleted;
}
