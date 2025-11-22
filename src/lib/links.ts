import { prisma } from "./prisma";

export type LinkDto = {
  id: string;
  code: string;
  url: string;
  totalClicks: number;
  lastClickedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export const serializeLink = (link: {
  id: string;
  code: string;
  url: string;
  totalClicks: number;
  lastClickedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): LinkDto => ({
  id: link.id,
  code: link.code,
  url: link.url,
  totalClicks: link.totalClicks,
  lastClickedAt: link.lastClickedAt ? link.lastClickedAt.toISOString() : null,
  createdAt: link.createdAt.toISOString(),
  updatedAt: link.updatedAt.toISOString(),
});

export const listLinks = async (): Promise<LinkDto[]> => {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  return links.map(serializeLink);
};

export const findLinkByCode = async (code: string) => {
  return prisma.link.findUnique({ where: { code } });
};

export const getLinkDetails = async (code: string) => {
  const link = await findLinkByCode(code);
  return link ? serializeLink(link) : null;
};

export const createLink = async (data: { code: string; url: string }) => {
  const link = await prisma.link.create({ data });
  return serializeLink(link);
};

export const deleteLinkByCode = async (code: string) => {
  await prisma.link.delete({ where: { code } });
};

export const recordClick = async (code: string) => {
  const link = await prisma.link.update({
    where: { code },
    data: {
      totalClicks: { increment: 1 },
      lastClickedAt: new Date(),
    },
  });

  return serializeLink(link);
};

