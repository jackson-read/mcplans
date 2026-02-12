import { pgTable, serial, text, boolean, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const worlds = pgTable("worlds", {
  id: serial("id").primaryKey(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(), // The Creator
  name: text("name").notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").references(() => worlds.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(), // The User (Owner or Guest)
  role: text("role").default("member"), // 'owner' or 'member'
  status: text("status").default("pending"),
});

// Relations allow us to "Join" these tables later
export const worldsRelations = relations(worlds, ({ many }) => ({
  members: many(members),
}));

export const membersRelations = relations(members, ({ one }) => ({
  world: one(worlds, {
    fields: [members.worldId],
    references: [worlds.id],
  }),
}));

// ... other tables ...

// Make sure 'export' is here!
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  worldId: integer("world_id").references(() => worlds.id, { onDelete: 'cascade' }).notNull(),
  description: text("description").notNull(),
  isCompleted: boolean("is_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});