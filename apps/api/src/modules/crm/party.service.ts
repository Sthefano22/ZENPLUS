import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";

export async function resolveParty(input: {
  email?: string;
  phone?: string;
  fullName: string;
}): Promise<{ partyId: string; isNew: boolean }> {
  const or: any[] = [];
  if (input.email) or.push({ email: input.email });
  if (input.phone) or.push({ phone: input.phone });

  const existing = or.length
    ? await prisma.parties.findFirst({ where: { OR: or } })
    : null;

  if (existing) {
    return { partyId: existing.id, isNew: false };
  }

  const created = await prisma.parties.create({
    data: {
      id: randomUUID(),
      party_type: "PERSON",
      email: input.email ?? null,
      phone: input.phone ?? null,
      full_name: input.fullName,
    },
  });

  return { partyId: created.id, isNew: true };
}