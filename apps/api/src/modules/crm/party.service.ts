import { prisma } from "../../lib/prisma";

export async function resolveParty(input: {
  email?: string;
  phone?: string;
  fullName: string;
}): Promise<{ partyId: string; isNew: boolean }> {
  const or: any[] = [];
  if (input.email) or.push({ email: input.email });
  if (input.phone) or.push({ phone: input.phone });

  const existing = or.length
    ? await prisma.party.findFirst({ where: { OR: or } })
    : null;

  if (existing) {
    return { partyId: existing.id, isNew: false };
  }

  const created = await prisma.party.create({
    data: {
      type: "PERSON",
      email: input.email,
      phone: input.phone,
      fullName: input.fullName,
    },
  });

  return { partyId: created.id, isNew: true };
}