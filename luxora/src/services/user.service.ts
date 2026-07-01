import bcrypt from "bcryptjs";
import { db, isDbConfigured } from "@/lib/prisma";
import {
  DEFAULT_NOTIFICATION_PREFS,
  notificationPrefsSchema,
  type NotificationPrefsInput,
} from "@/lib/validations/user";
import type { AddressInput, UpdateProfileInput } from "@/lib/validations/user";
import { computeLoyaltyPoints } from "@/lib/loyalty";

const QUALIFYING_ORDER_STATUSES = [
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

export async function getUserProfile(userId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      passwordHash: true,
      createdAt: true,
    },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  return {
    id: user.id,
    email: user.email,
    name: user.name ?? "",
    phone: user.phone ?? "",
    avatarUrl: user.avatarUrl,
    hasPassword: Boolean(user.passwordHash),
    memberSince: user.createdAt,
  };
}

export async function updateUserProfile(userId: string, input: UpdateProfileInput) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const user = await db.user.update({
    where: { id: userId },
    data: {
      name: input.name.trim(),
      phone: input.phone?.trim() || null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
    },
  });

  return user;
}

export async function changeUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });

  if (!user?.passwordHash) {
    throw new Error("NO_PASSWORD");
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("INVALID_PASSWORD");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return true;
}

export async function getUserAddresses(userId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  return db.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createUserAddress(userId: string, input: AddressInput) {
  if (!isDbConfigured) throw new Error("Database not configured");

  return db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        label: input.label,
        fullName: input.fullName,
        phone: input.phone || null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state || null,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault,
      },
    });
  });
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  input: AddressInput
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) throw new Error("NOT_FOUND");

  return db.$transaction(async (tx) => {
    if (input.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id: addressId },
      data: {
        label: input.label,
        fullName: input.fullName,
        phone: input.phone || null,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        state: input.state || null,
        postalCode: input.postalCode,
        country: input.country,
        isDefault: input.isDefault,
      },
    });
  });
}

export async function deleteUserAddress(userId: string, addressId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const existing = await db.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!existing) throw new Error("NOT_FOUND");

  await db.address.delete({ where: { id: addressId } });
  return true;
}

export async function resolveUserLoyaltyPoints(userId: string) {
  if (!isDbConfigured) throw new Error("Database not configured");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  if (user.loyaltyPoints > 0) return user.loyaltyPoints;

  const orderAgg = await db.order.aggregate({
    where: {
      userId,
      status: { in: [...QUALIFYING_ORDER_STATUSES] },
    },
    _sum: { total: true },
  });

  const computed = computeLoyaltyPoints(Number(orderAgg._sum.total ?? 0));

  if (computed > 0) {
    await db.user.update({
      where: { id: userId },
      data: { loyaltyPoints: computed },
    });
  }

  return computed;
}

export async function getUserNotificationPrefs(userId: string): Promise<NotificationPrefsInput> {
  if (!isDbConfigured) throw new Error("Database not configured");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { notificationPrefs: true },
  });

  if (!user) throw new Error("USER_NOT_FOUND");

  if (!user.notificationPrefs) return DEFAULT_NOTIFICATION_PREFS;

  const parsed = notificationPrefsSchema.safeParse(user.notificationPrefs);
  return parsed.success ? parsed.data : DEFAULT_NOTIFICATION_PREFS;
}

export async function updateUserNotificationPrefs(
  userId: string,
  prefs: NotificationPrefsInput
) {
  if (!isDbConfigured) throw new Error("Database not configured");

  await db.user.update({
    where: { id: userId },
    data: { notificationPrefs: prefs },
  });

  return prefs;
}
