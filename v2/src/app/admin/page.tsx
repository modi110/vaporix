import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { readStaffSession } from "@/lib/auth/session";
import {
  getRecentVisits,
  getRewards,
  getStaffActivity,
  getTotals,
  lookUpCustomer,
} from "@/lib/loyalty/admin";
import { renderQrSvg } from "@/lib/loyalty/qr";
import { StaffBrand } from "../staff/StaffBrand";

/**
 * What the owner sees.
 *
 * Every visit and every redemption has been recorded since the programme
 * started, with the staff member who did it; this is the first screen that
 * shows any of it. It answers the question the scanner cannot: what has
 * actually been happening in the shop.
 */
export const dynamic = "force-dynamic";

// The shop's clock, stated outright: the server runs in UTC, and without this
// every time on the page would read one or two hours early.
const timeZone = "Europe/Madrid";

const dateTime = new Intl.DateTimeFormat("es-ES", {
  timeZone,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const date = new Intl.DateTimeFormat("es-ES", {
  timeZone,
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const session = await readStaffSession();
  if (!session) redirect("/staff/login");

  // Every signed-in staff member can open this page: the owner wants workers
  // to see customers and history too. Only the sign-in is required.

  const { c } = await searchParams;
  const query = c?.trim() ?? "";

  const [totals, visits, rewards, staff, found] = await Promise.all([
    getTotals(),
    getRecentVisits(),
    getRewards(),
    getStaffActivity(),
    query ? lookUpCustomer(query) : Promise.resolve(null),
  ]);

  // The card's own link, as a QR on this screen: the customer points their
  // phone's camera at it and their card opens. Built from the request's own
  // host so it also works on a dev machine.
  let cardQr: string | null = null;
  if (found) {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
    cardQr = await renderQrSvg(`${origin}/es/tarjeta/${found.qrToken}`);
  }

  return (
    <main className="admin-shell">
      <div className="staff-head">
        <StaffBrand />
        <div className="staff-head__actions">
          <Link className="staff-who staff-linkish" href="/staff">
            Escanear
          </Link>
          <form action="/api/staff/logout" method="post">
            <button className="staff-who staff-linkish" type="submit">
              Salir
            </button>
          </form>
        </div>
      </div>

      <h1 className="staff-title">Administración</h1>

      {/* Looking a customer up is the thing the owner does while someone is
          standing there, so it comes before the reading material.

          A plain GET form: the result is a server render of this same page
          with ?c=…, so there is no client JavaScript on this screen at all. */}
      <section className="admin-section">
        <h2 className="admin-h2">Buscar cliente</h2>
        <form className="admin-lookup" method="get">
          <input
            className="staff-field"
            name="c"
            defaultValue={query}
            placeholder="N.º de cliente o teléfono"
            inputMode="tel"
            autoComplete="off"
            aria-label="Número de cliente o teléfono"
          />
          <button className="staff-button" type="submit">
            Buscar
          </button>
        </form>

        {query && !found ? (
          <p className="staff-note staff-note--warn">
            No hay ninguna tarjeta con {query}.
          </p>
        ) : null}

        {found ? (
          <div className="staff-card">
            <div className="staff-customer">
              <p className="staff-name">{found.name}</p>
              <p className="staff-count">
                <b>{found.visits}</b>
                <em>/ {found.visitsRequired}</em>
              </p>
            </div>

            {/* The only place on the dashboard that shows how to contact
                someone. Everything else is a name and a card number. */}
            <dl className="admin-detail">
              <dt>Teléfono</dt>
              <dd>{found.phone}</dd>
              <dt>Email</dt>
              <dd>{found.email ?? "—"}</dd>
              <dt>N.º de cliente</dt>
              <dd className="admin-num">{found.cardNumber}</dd>
              <dt>Alta</dt>
              <dd>{date.format(new Date(found.joinedAt))}</dd>
              <dt>Estado</dt>
              <dd>
                {!found.active
                  ? "Tarjeta desactivada"
                  : found.rewardAvailable
                    ? "Recompensa pendiente"
                    : "Activa"}
              </dd>
            </dl>

            {cardQr ? (
              <div className="admin-handback">
                <div
                  className="admin-qr"
                  dangerouslySetInnerHTML={{ __html: cardQr }}
                />
                <p className="admin-muted">
                  ¿Ha perdido su tarjeta? Que escanee este código con la cámara
                  de su móvil y la tendrá de vuelta.
                </p>
              </div>
            ) : null}

            <div className="admin-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Lavado</th>
                    <th>Atendido por</th>
                  </tr>
                </thead>
                <tbody>
                  {found.history.map((v) => (
                    <tr key={v.id}>
                      <td className="admin-num">
                        {dateTime.format(new Date(v.at))}
                      </td>
                      <td className="admin-num">{v.visitNumber}</td>
                      <td>{v.staffName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {found.history.length === 0 ? (
                <p className="admin-empty">Todavía sin lavados.</p>
              ) : null}
            </div>
          </div>
        ) : null}
      </section>

      <section className="admin-section">
        <div className="admin-stats">
          <Stat value={totals.customers} label="Clientes" />
          <Stat value={totals.activeCards} label="Tarjetas activas" />
          <Stat value={totals.visits7} label="Lavados · 7 días" />
          <Stat value={totals.visits30} label="Lavados · 30 días" />
          <Stat value={totals.visitsAll} label="Lavados · total" />
          <Stat
            value={totals.rewardsOutstanding}
            label="Recompensas pendientes"
            owed
          />
          <Stat value={totals.rewardsRedeemed} label="Recompensas dadas" />
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-h2">Últimos lavados</h2>
        <div className="admin-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>N.º</th>
                <th>Lavado</th>
                <th>Atendido por</th>
              </tr>
            </thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id}>
                  <td className="admin-num">
                    {dateTime.format(new Date(v.at))}
                  </td>
                  <td>
                    <b>{v.customerName}</b>
                  </td>
                  <td className="admin-num admin-muted">{v.cardNumber}</td>
                  <td className="admin-num">{v.visitNumber}</td>
                  <td>{v.staffName}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {visits.length === 0 ? (
            <p className="admin-empty">Todavía sin lavados registrados.</p>
          ) : null}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-h2">Recompensas</h2>
        <div className="admin-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Conseguida</th>
                <th>Cliente</th>
                <th>N.º</th>
                <th>Estado</th>
                <th>Dada por</th>
              </tr>
            </thead>
            <tbody>
              {rewards.map((r) => (
                <tr key={r.id}>
                  <td className="admin-num">
                    {date.format(new Date(r.earnedAt))}
                  </td>
                  <td>
                    <b>{r.customerName}</b>
                  </td>
                  <td className="admin-num admin-muted">{r.cardNumber}</td>
                  <td>
                    {r.status === "redeemed" && r.redeemedAt
                      ? `Dada · ${date.format(new Date(r.redeemedAt))}`
                      : r.status === "available"
                        ? "Pendiente"
                        : "Anulada"}
                  </td>
                  <td>{r.redeemedBy ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rewards.length === 0 ? (
            <p className="admin-empty">Todavía sin recompensas.</p>
          ) : null}
        </div>
      </section>

      <section className="admin-section">
        <h2 className="admin-h2">Personal</h2>
        <div className="admin-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Lavados</th>
                <th>Recompensas dadas</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((s) => (
                <tr key={s.name}>
                  <td>
                    <b>{s.name}</b>
                    {s.active ? "" : " · baja"}
                  </td>
                  <td className="admin-muted">
                    {s.role === "admin" ? "Administración" : "Personal"}
                  </td>
                  <td className="admin-num">{s.visits}</td>
                  <td className="admin-num">{s.rewardsGiven}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Stat({
  value,
  label,
  owed = false,
}: {
  value: number;
  label: string;
  owed?: boolean;
}) {
  return (
    <div className={`admin-stat ${owed ? "admin-stat--owed" : ""}`}>
      <b className="admin-num">{value}</b>
      <span>{label}</span>
    </div>
  );
}
