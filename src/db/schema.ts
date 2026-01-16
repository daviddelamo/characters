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
  playedIn: many(playedCharacters),
}));

export const forbiddenWordsRelations = relations(forbiddenWords, ({ one }) => ({
  character: one(characters, {
    fields: [forbiddenWords.characterId],
    references: [characters.id],
  }),
}));

export const games = pgTable("games", {
  id: uuid("id").defaultRandom().primaryKey(),
  finished: text("finished").default("false"), // keeping it simple, boolean might vary in postgres setup sometimes, text 'true'/'false' is safe or boolean
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const playedCharacters = pgTable("played_characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  gameId: uuid("game_id")
    .references(() => games.id, { onDelete: "cascade" })
    .notNull(),
  characterId: uuid("character_id")
    .references(() => characters.id, { onDelete: "cascade" })
    .notNull(),
  playedAt: timestamp("played_at").defaultNow().notNull(),
});

export const gamesRelations = relations(games, ({ many }) => ({
  playedCharacters: many(playedCharacters),
}));

export const playedCharactersRelations = relations(playedCharacters, ({ one }) => ({
  game: one(games, {
    fields: [playedCharacters.gameId],
    references: [games.id],
  }),
  character: one(characters, {
    fields: [playedCharacters.characterId],
    references: [characters.id],
  }),
}));
