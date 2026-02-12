'use server';

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { worlds, members, tasks } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server"; // We need this to search for users!

// ... keep your imports (make sure clerkClient is there!)

export async function createPlan(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in!");

  const name = formData.get("name") as string;
  const inviteUsername = formData.get("inviteUsername") as string;

  // 1. If they tried to invite someone, check if that user exists FIRST 🕵️‍♂️
  let invitedUserId: string | null = null;
  
  if (inviteUsername && inviteUsername.trim() !== "") {
    const client = await clerkClient();
    const userList = await client.users.getUserList({ 
      username: [inviteUsername] 
    });

    if (userList.data.length === 0) {
      throw new Error(`User '${inviteUsername}' not found! Check the spelling.`);
    }
    invitedUserId = userList.data[0].id;
  }

  // 2. Create the World 🌍
  const [newWorld] = await db.insert(worlds).values({
    ownerId: userId,
    name: name,
  }).returning({ id: worlds.id });

  // 3. Add YOU as the owner 👑
  await db.insert(members).values({
    userId: userId,
    worldId: newWorld.id,
    role: "owner",
  });

  // 4. If we found a friend, add them too! 🤝
  if (invitedUserId) {
    await db.insert(members).values({
      userId: invitedUserId,
      worldId: newWorld.id,
      role: "member",
    });
  }

  redirect("/dashboard");
}

export async function deletePlan(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const planId = Number(formData.get("id"));

  // Only the OWNER can delete the world
  await db.delete(worlds)
    .where(and(eq(worlds.id, planId), eq(worlds.ownerId, userId)));

  redirect("/dashboard");
}

export async function inviteUser(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const worldId = Number(formData.get("worldId"));
  const usernameToInvite = formData.get("username") as string;

  // 1. Security: Are you the owner?
  const [world] = await db.select()
    .from(worlds)
    .where(and(eq(worlds.id, worldId), eq(worlds.ownerId, userId)));

  if (!world) throw new Error("You are not the owner of this world!");

  // 2. Ask Clerk to find the user ID from the username
  const client = await clerkClient();
  const userList = await client.users.getUserList({ 
    username: [usernameToInvite] 
  });

  if (userList.data.length === 0) {
    throw new Error("User not found!"); // handle this better in UI later
  }

  const invitedUserId = userList.data[0].id;

  // 3. Add them to the members table
  await db.insert(members).values({
    userId: invitedUserId,
    worldId: worldId,
    role: "member", // They are just a member, not owner
  });

  redirect("/dashboard");
}

// ... keep existing imports ...

// 1. ADD a new task
export async function createTask(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const worldId = Number(formData.get("worldId"));
  const description = formData.get("description") as string;

  // Security: Check if user is a member of this world first!
  const memberCheck = await db.query.members.findFirst({
    where: and(eq(members.worldId, worldId), eq(members.userId, userId))
  });

  if (!memberCheck) throw new Error("You are not in this world!");

  await db.insert(tasks).values({
    worldId: worldId,
    description: description,
    isCompleted: false, // Starts as not done
  });
  
  // We use revalidatePath so the UI updates immediately without a full reload
  redirect(`/dashboard/world/${worldId}`); 
}

// 2. CHECK OFF (Delete) a task
export async function completeTask(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const taskId = Number(formData.get("taskId"));
  const worldId = Number(formData.get("worldId")); // Need this to know where to go back to

  // We just DELETE it so it's gone from the wheel
  await db.delete(tasks).where(eq(tasks.id, taskId));

  redirect(`/dashboard/world/${worldId}`);
}

// app/actions.ts

export async function removeMember(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const membershipId = Number(formData.get("membershipId"));
  const worldId = Number(formData.get("worldId"));

  // 1. Find the member record to see who it is
  const [targetMember] = await db.select()
    .from(members)
    .where(eq(members.id, membershipId));

  if (!targetMember) return; // Already gone

  // 2. Check if the current user is the owner of the world
  const [currentUser] = await db.select()
    .from(members)
    .where(and(eq(members.worldId, worldId), eq(members.userId, userId)));

  const isOwner = currentUser?.role === "owner";
  const isSelf = targetMember.userId === userId;

  // 3. Logic: Owner can kick anyone; Members can only remove themselves
  if (isOwner || isSelf) {
    if (targetMember.role === "owner" && isSelf) {
      // Prevent owner from leaving (they should delete the world instead)
      return; 
    }

    await db.delete(members).where(eq(members.id, membershipId));
  }

  // 4. CRITICAL: This refreshes the page so the name disappears!
  if (isSelf) {
    redirect("/dashboard");
  } else {
    redirect(`/dashboard/world/${worldId}`);
  }
}