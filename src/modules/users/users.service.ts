import { clerkClient } from "@clerk/express";

export interface AdminUserSummary {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
  createdAt: number;
  role: string | null;
}

export const usersService = {
  async listUsers(limit = 50, offset = 0): Promise<{ users: AdminUserSummary[]; totalCount: number }> {
    const result = await clerkClient.users.getUserList({ limit, offset, orderBy: "-created_at" });

    const users: AdminUserSummary[] = result.data.map((u) => ({
      id: u.id,
      email: u.emailAddresses[0]?.emailAddress ?? null,
      firstName: u.firstName,
      lastName: u.lastName,
      imageUrl: u.imageUrl,
      createdAt: u.createdAt,
      role: (u.publicMetadata?.role as string) ?? null,
    }));

    return { users, totalCount: result.totalCount };
  },
};