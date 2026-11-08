import type { Locale } from "@/i18n/routing";

/**
 * The privacy policy, in both languages.
 *
 * Kept as content rather than in the message files: it is a long document,
 * not interface text, and it is written and reviewed as one piece. Business
 * facts (name, address, email, NIF) are filled in from `site` by the page, so
 * they are written down in one place only.
 *
 * It covers what the site actually does today: the loyalty card. If the site
 * starts collecting anything else (a booking form, analytics), this must be
 * updated first.
 */
export type PolicySection = {
  heading: string;
  /** Paragraphs; `{{controller}}` etc. are replaced by the page. */
  body: string[];
};

export const privacy: Record<
  Locale,
  { title: string; lede: string; updated: string; sections: PolicySection[] }
> = {
  es: {
    title: "Política de privacidad.",
    lede: "Qué datos guardamos cuando te unes a la tarjeta de fidelidad, para qué y qué puedes hacer con ellos.",
    updated: "Última actualización: noviembre de 2026",
    sections: [
      {
        heading: "Quién es el responsable",
        body: [
          "{{controller}}, con NIF {{taxId}}, domicilio en {{address}}.",
          "Para cualquier duda sobre tus datos: {{email}} o el teléfono {{phone}}.",
        ],
      },
      {
        heading: "Qué datos guardamos y para qué",
        body: [
          "Cuando te unes a la tarjeta de fidelidad guardamos tu nombre, tu número de teléfono y, si nos lo das, tu email. Son los datos que pedimos en el formulario y no necesitamos más.",
          "Después guardamos cada lavado que se sella en tu tarjeta: la fecha, la hora y quién del equipo lo registró. Así sabemos cuántos llevas y cuándo te corresponde el lavado gratis.",
          "Usamos estos datos solo para llevar tu tarjeta: sellarla, dártela de nuevo si la pierdes y entregarte tu lavado gratis. No los usamos para publicidad ni para elaborar perfiles.",
        ],
      },
      {
        heading: "Por qué podemos usarlos",
        body: [
          "Por tu consentimiento: te unes tú porque quieres, rellenando el formulario. Puedes retirarlo cuando quieras, y entonces borramos tu tarjeta.",
        ],
      },
      {
        heading: "Cuánto tiempo los guardamos",
        body: [
          "Mientras tu tarjeta esté activa. Si dejas de venir y quieres que los borremos, o si pides la baja, los eliminamos. Solo conservamos lo que la ley nos obligue a conservar.",
        ],
      },
      {
        heading: "Quién más los ve",
        body: [
          "Nadie los vende ni los cede para publicidad. Los guardamos en sistemas de empresas que nos prestan el servicio de alojamiento y base de datos (por ejemplo Supabase, con la base de datos en la Unión Europea, y Vercel, que aloja la web). Actúan por nuestra cuenta y bajo contrato, solo para hacer funcionar el servicio.",
          "Dentro del taller, solo el personal autorizado ve tu nombre y tu tarjeta, con su propio acceso.",
        ],
      },
      {
        heading: "Tu tarjeta es un enlace privado",
        body: [
          "El enlace y el código QR de tu tarjeta funcionan como una llave: quien los tenga puede enseñar tu tarjeta en el mostrador. No los compartas. Si crees que alguien más los tiene, avísanos y te damos una tarjeta nueva.",
        ],
      },
      {
        heading: "Tus derechos",
        body: [
          "Puedes pedirnos acceder a tus datos, corregirlos, borrarlos, limitar su uso, llevártelos o oponerte a que los usemos. Escríbenos a {{email}} o díselo al equipo en el taller. Te respondemos en el plazo máximo de un mes.",
          "Si piensas que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).",
        ],
      },
    ],
  },
  en: {
    title: "Privacy policy.",
    lede: "What data we keep when you join the loyalty card, why, and what you can do about it.",
    updated: "Last updated: November 2026",
    sections: [
      {
        heading: "Who is responsible",
        body: [
          "{{controller}}, tax ID (NIF) {{taxId}}, at {{address}}.",
          "For any question about your data: {{email}} or {{phone}}.",
        ],
      },
      {
        heading: "What we keep and why",
        body: [
          "When you join the loyalty card we keep your name, your phone number and, if you give it, your email. Those are the details the form asks for, and we do not need more.",
          "Afterwards we keep each wash stamped on your card: the date, the time and which team member recorded it. That is how we know how many you have and when your free wash is due.",
          "We use this data only to run your card: stamping it, giving it back if you lose it, and handing you your free wash. We do not use it for advertising or to build profiles.",
        ],
      },
      {
        heading: "Why we may use it",
        body: [
          "Your consent: you join because you choose to, by filling in the form. You can withdraw it at any time, and we then delete your card.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "For as long as your card is active. If you stop coming and want it deleted, or you ask to leave, we remove it. We only keep what the law requires us to keep.",
        ],
      },
      {
        heading: "Who else sees it",
        body: [
          "Nobody sells it or hands it on for advertising. It is stored with companies that provide our hosting and database (for example Supabase, with the database in the European Union, and Vercel, which hosts the website). They act on our behalf and under contract, only to make the service work.",
          "Inside the shop, only authorised staff see your name and card, each with their own login.",
        ],
      },
      {
        heading: "Your card is a private link",
        body: [
          "The link and QR code of your card work like a key: whoever has them can show your card at the counter. Do not share them. If you think someone else has them, tell us and we will give you a new card.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You can ask us to give you access to your data, correct it, delete it, restrict its use, take a copy of it, or object to our using it. Write to {{email}} or tell the team in the shop. We reply within one month at most.",
          "If you think we have not handled your data properly, you can complain to the Spanish Data Protection Agency (www.aepd.es).",
        ],
      },
    ],
  },
};
