import { prisma } from "./prisma";

type CreateNotificationInput = {
  userId: number;
  title: string;
  body?: string;
  link?: string;
};

export async function createNotification({
  userId,
  title,
  body,
  link,
}: CreateNotificationInput) {
  if (!userId) return;
  await prisma.notification.create({
    data: {
      userId,
      title,
      body: body ?? null,
      link: link ?? null,
    },
  });
}
