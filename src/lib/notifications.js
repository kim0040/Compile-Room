import { prisma } from "./prisma";

export async function createNotification({
  userId,
  title,
  body,
  link,
}) {
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
