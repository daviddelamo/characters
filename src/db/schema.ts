import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const forbiddenWords = pgTable("forbidden_words", {
  id: uuid("id").defaultRandom().primaryKey(),
  characterId: uuid("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  word: text("word").notNull(),
});

export const charactersRelations = relations(characters, ({ many }) => ({
  forbiddenWords: many(forbiddenWords),
}));

export const forbiddenWordsRelations = relations(forbiddenWords, ({ one }) => ({
  character: one(characters, {
    fields: [forbiddenWords.characterId],
    references: [characters.id],
  }),
}));
