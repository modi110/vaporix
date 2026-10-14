import "server-only";

import { serviceClient } from "@/lib/supabase/server";
import { normalizePhone } from "./phone";

/**
 * Read-only queries for the admin dashboard.
 *
 * Kept out of `service.ts` on purpose: that module is the write path — the
 * thin layer over the Postgres functions that change loyalty state — and it
 * stays small so it can be read in one sitting. Nothing here writes anything.
 */

const DAY = 24 * 60 * 60 * 1000;

function daysAgo(n: number): string {
  return new Date(Date.now() - n * DAY).toISOString();
}

export type Totals = {
  customers: number;
  activeCards: number;
  visits7: number;
  visits30: number;
  visitsAll: number;
  rewardsOutstanding: number;
  rewardsRedeemed: number;
};

export async function getTotals(): Promise<Totals> {
  const db = serviceClient();

  // `head: true` asks PostgREST for the count and no rows at all, so these
  // stay cheap however many visits accumulate.
  const rows = (table: string) =>
    db.from(table).select("*", { count: "exact", head: true });

  const results = await Promise.all([
    rows("customers"),
    rows("loyalty_cards").eq("active", true),
    rows("visits").gte("created_at", daysAgo(7)),
    rows("visits").gte("created_at", daysAgo(30)),
    rows("visits"),
    rows("rewards").eq("status", "available"),
    rows("rewards").eq("status", "redeemed"),
  ]);

  // A failed count must not show up as a confident 0 on the owner's screen.
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`admin totals failed: ${failed.error.message}`);

  const [
    customers,
    activeCards,
    visits7,
    visits30,
    visitsAll,
    rewardsOutstanding,
    rewardsRedeemed,
  ] = results;

  return {
    customers: customers.count ?? 0,
    activeCards: activeCards.count ?? 0,
    visits7: visits7.count ?? 0,
    visits30: visits30.count ?? 0,
    visitsAll: visitsAll.count ?? 0,
    rewardsOutstanding: rewardsOutstanding.count ?? 0,
    rewardsRedeemed: rewardsRedeemed.count ?? 0,
  };
}

/** A name embedded from a joined table. PostgREST may return it as an array. */
type Embedded<T> = T | T[] | null;

function one<T>(value: Embedded<T>): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value;
}

export type VisitRow = {
  id: string;
  at: string;
  customerName: string;
  cardNumber: string;
  visitNumber: number;
  staffName: string;
};

export async function getRecentVisits(limit = 50): Promise<VisitRow[]> {
  const { data, error } = await serviceClient()
    .from("visits")
    .select(
      "id, created_at, visit_number, customers(name), loyalty_cards(card_number), staff(name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`admin visits query failed: ${error.message}`);

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      created_at: string;
      visit_number: number;
      customers: Embedded<{ name: string }>;
      loyalty_cards: Embedded<{ card_number: string }>;
      staff: Embedded<{ name: string }>;
    };
    return {
      id: r.id,
      at: r.created_at,
      customerName: one(r.customers)?.name ?? "—",
      cardNumber: one(r.loyalty_cards)?.card_number ?? "—",
      visitNumber: r.visit_number,
      staffName: one(r.staff)?.name ?? "—",
    };
  });
}

export type RewardRow = {
  id: string;
  status: string;
  earnedAt: string;
  redeemedAt: string | null;
  customerName: string;
  cardNumber: string;
  redeemedBy: string | null;
};

export async function getRewards(limit = 50): Promise<RewardRow[]> {
  const { data, error } = await serviceClient()
    .from("rewards")
    .select(
      "id, status, created_at, redeemed_at, customers(name), loyalty_cards(card_number), staff(name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`admin rewards query failed: ${error.message}`);

  return (data ?? []).map((row) => {
    const r = row as {
      id: string;
      status: string;
      created_at: string;
      redeemed_at: string | null;
      customers: Embedded<{ name: string }>;
      loyalty_cards: Embedded<{ card_number: string }>;
      staff: Embedded<{ name: string }>;
    };
    return {
      id: r.id,
      status: r.status,
      earnedAt: r.created_at,
      redeemedAt: r.redeemed_at,
      customerName: one(r.customers)?.name ?? "—",
      cardNumber: one(r.loyalty_cards)?.card_number ?? "—",
      redeemedBy: one(r.staff)?.name ?? null,
    };
  });
}

export type StaffRow = {
  name: string;
  role: string;
  active: boolean;
  visits: number;
  rewardsGiven: number;
};

/**
 * Per-person activity.
 *
 * Two counts per staff member rather than one grouped query: PostgREST has no
 * GROUP BY, and a database view or RPC for this would be a migration to
 * maintain. The staff table is a handful of rows in a car wash, so the extra
 * round trips cost less than the thing they would replace.
 */
export async function getStaffActivity(): Promise<StaffRow[]> {
  const db = serviceClient();

  const { data, error } = await db
    .from("staff")
    .select("id, name, role, active")
    .order("name");

  if (error) throw new Error(`admin staff query failed: ${error.message}`);

  return Promise.all(
    (data ?? []).map(async (row) => {
      const s = row as { id: string; name: string; role: string; active: boolean };

      const [visits, rewards] = await Promise.all([
        db
          .from("visits")
          .select("*", { count: "exact", head: true })
          .eq("staff_id", s.id),
        db
          .from("rewards")
          .select("*", { count: "exact", head: true })
          .eq("redeemed_by_staff_id", s.id),
      ]);

      return {
        name: s.name,
        role: s.role,
        active: s.active,
        visits: visits.count ?? 0,
        rewardsGiven: rewards.count ?? 0,
      };
    }),
  );
}

export type CustomerDetail = {
  /** The card credential, so the owner can hand a lost card back. */
  qrToken: string;
  name: string;
  phone: string;
  email: string | null;
  cardNumber: string;
  visits: number;
  /** The card's own frozen target if it has one, otherwise the current one. */
  visitsRequired: number;
  rewardAvailable: boolean;
  active: boolean;
  joinedAt: string;
  history: { id: string; at: string; visitNumber: number; staffName: string }[];
};

/**
 * One customer, by the number printed on their card or by phone.
 *
 * By phone is how a lost card comes back: registration never re-issues an
 * existing card (that would give it to anyone who knows the number), so the
 * customer asks at the counter and the owner finds them here.
 *
 * This is the only place phone and email are read. Everywhere else on the
 * dashboard shows a name and a card number, so a screen left open at the
 * counter is not a list of customer phone numbers.
 */
export async function lookUpCustomer(
  query: string,
): Promise<CustomerDetail | null> {
  const db = serviceClient();

  const cards = db
    .from("loyalty_cards")
    .select(
      "id, qr_token, card_number, visits, visits_required, reward_available, active, created_at, customers(name, phone_e164, email)",
    );

  let byKey;
  if (/^[0-9]{7}$/.test(query)) {
    byKey = cards.eq("card_number", query);
  } else {
    const phone = normalizePhone(query);
    if (!phone) return null;

    const { data: customer, error: customerError } = await db
      .from("customers")
      .select("id")
      .eq("phone_e164", phone)
      .maybeSingle();

    if (customerError) throw new Error(`admin lookup failed: ${customerError.message}`);
    if (!customer) return null;
    byKey = cards.eq("customer_id", customer.id);
  }

  const { data, error } = await byKey.maybeSingle();

  if (error) throw new Error(`admin lookup failed: ${error.message}`);
  if (!data) return null;

  const card = data as {
    id: string;
    qr_token: string;
    card_number: string;
    visits: number;
    visits_required: number | null;
    reward_available: boolean;
    active: boolean;
    created_at: string;
    customers: Embedded<{ name: string; phone_e164: string; email: string | null }>;
  };
  const customer = one(card.customers);

  // Null means the card follows the current programme. Reading the config
  // rather than assuming 4 keeps this honest for a customer whose target was
  // frozen when the offer changed — see changing-the-offer.md.
  let target = card.visits_required;
  if (target === null) {
    const { data: config } = await db
      .from("loyalty_config")
      .select("visits_required")
      .limit(1)
      .maybeSingle();
    target = (config as { visits_required: number } | null)?.visits_required ?? 4;
  }

  const { data: visitRows } = await db
    .from("visits")
    .select("id, created_at, visit_number, staff(name)")
    .eq("loyalty_card_id", card.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return {
    qrToken: card.qr_token,
    name: customer?.name ?? "—",
    phone: customer?.phone_e164 ?? "—",
    email: customer?.email ?? null,
    cardNumber: card.card_number,
    visits: card.visits,
    visitsRequired: target,
    rewardAvailable: card.reward_available,
    active: card.active,
    joinedAt: card.created_at,
    history: (visitRows ?? []).map((row) => {
      const v = row as {
        id: string;
        created_at: string;
        visit_number: number;
        staff: Embedded<{ name: string }>;
      };
      return {
        id: v.id,
        at: v.created_at,
        visitNumber: v.visit_number,
        staffName: one(v.staff)?.name ?? "—",
      };
    }),
  };
}
