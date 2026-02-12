'use server';

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { worlds, members, tasks } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPlan(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("You must be logged in!");

  const name = formData.get("name") as string;
  const inviteUsername = formData.get("inviteUsername") as string;

  let invitedUserId: string | null = null;
  
  if (inviteUsername && inviteUsername.trim() !== "") {
    const client = await clerkClient();
    const userList = await client.users.getUserList({ 
      username: [inviteUsername] 
    });

    if (userList.data.length === 0) {
      throw new Error(`User '${inviteUsername}' not found!`);
    }
    invitedUserId = userList.data[0].id;
  }

  // 1. Create the World
  const [newWorld] = await db.insert(worlds).values({
    ownerId: userId,
    name: name,
  }).returning({ id: worlds.id });

  // 2. Add YOU as the owner (status: accepted)
  await db.insert(members).values({
    userId: userId,
    worldId: newWorld.id,
    role: "owner",
    status: "accepted", // Owners don't need to invite themselves!
  });

  // 3. Add friend as member (status: pending)
  if (invitedUserId) {
    await db.insert(members).values({
      userId: invitedUserId,
      worldId: newWorld.id,
      role: "member",
      status: "pending", // They must accept first
    });
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function inviteUser(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const worldId = Number(formData.get("worldId"));
  const usernameToInvite = formData.get("username") as string;

  const client = await clerkClient();
  const userList = await client.users.getUserList({ 
    username: [usernameToInvite] 
  });

  if (userList.data.length === 0) throw new Error("User not found!");

  const invitedUserId = userList.data[0].id;

  // Add friend as pending member
  await db.insert(members).values({
    userId: invitedUserId,
    worldId: worldId,
    role: "member",
    status: "pending",
  });

  revalidatePath(`/dashboard/world/${worldId}`);
  redirect("/dashboard");
}

export async function acceptInvite(formData: FormData) {
  const memberId = Number(formData.get("memberId"));
  await db.update(members)
    .set({ status: "accepted" })
    .where(eq(members.id, memberId));
  
  revalidatePath("/dashboard");
}

export async function declineInvite(formData: FormData) {
  const memberId = Number(formData.get("memberId"));
  await db.delete(members).where(eq(members.id, memberId));
  
  revalidatePath("/dashboard");
}

export async function deletePlan(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const planId = Number(formData.get("id"));
  await db.delete(worlds)
    .where(and(eq(worlds.id, planId), eq(worlds.ownerId, userId)));

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createTask(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const worldId = Number(formData.get("worldId"));
  const description = formData.get("description") as string;

  await db.insert(tasks).values({
    worldId: worldId,
    description: description,
    isCompleted: false,
  });
  
  revalidatePath(`/dashboard/world/${worldId}`);
}

export async function completeTask(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const taskId = Number(formData.get("taskId"));
  const worldId = Number(formData.get("worldId"));

  await db.delete(tasks).where(eq(tasks.id, taskId));

  revalidatePath(`/dashboard/world/${worldId}`);
}

export async function removeMember(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  const membershipId = Number(formData.get("membershipId"));
  const worldId = Number(formData.get("worldId"));

  const [targetMember] = await db.select().from(members).where(eq(members.id, membershipId));
  if (!targetMember) return;

  const [currentUser] = await db.select().from(members).where(and(eq(members.worldId, worldId), eq(members.userId, userId)));

  const isOwner = currentUser?.role === "owner";
  const isSelf = targetMember.userId === userId;

  if (isOwner || isSelf) {
    if (targetMember.role === "owner" && isSelf) return; 
    await db.delete(members).where(eq(members.id, membershipId));
  }

  if (isSelf) {
    redirect("/dashboard");
  } else {
    revalidatePath(`/dashboard/world/${worldId}`);
  }
}