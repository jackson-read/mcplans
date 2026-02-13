'use server';

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { worlds, members, tasks } from "@/db/schema";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createPlan(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;

  // 1. Create the World - explicitly setting ownerId
  const [newWorld] = await db.insert(worlds).values({
    name: name,
    ownerId: userId, // 👈 CRITICAL: This must match your Clerk userId
  }).returning();

  // 2. Add yourself as a member with 'owner' role as backup
  await db.insert(members).values({
    userId: userId,
    worldId: newWorld.id,
    role: "owner", 
    status: "accepted"
  });

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

// ... (Your existing code is above here) ...

// 1. Rename World
export async function renameWorld(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const worldId = parseInt(formData.get("worldId") as string);
  const newName = formData.get("newName") as string;

  // Verify Ownership
  const membership = await db.query.members.findFirst({
    where: and(eq(members.userId, userId), eq(members.worldId, worldId), eq(members.role, "owner"))
  });

  if (!membership) throw new Error("Not authorized to rename this world");

  await db.update(worlds)
    .set({ name: newName })
    .where(eq(worlds.id, worldId));

  revalidatePath(`/dashboard/settings/${worldId}`);
  revalidatePath("/dashboard");
}

// 2. Kick Member
export async function kickMember(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const memberId = parseInt(formData.get("memberId") as string);

  // Get the victim's details to find the world ID
  const victim = await db.query.members.findFirst({
    where: eq(members.id, memberId)
  });

  if (!victim) throw new Error("Member not found");

  // Verify the requester is the OWNER of that specific world
  const requester = await db.query.members.findFirst({
    where: and(eq(members.userId, userId), eq(members.worldId, victim.worldId), eq(members.role, "owner"))
  });

  if (!requester) throw new Error("You must be the owner to kick players");

  await db.delete(members).where(eq(members.id, memberId));

  revalidatePath(`/dashboard/settings/${victim.worldId}`);
}