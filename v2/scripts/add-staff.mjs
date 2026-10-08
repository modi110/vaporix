#!/usr/bin/env node
/**
 * Creates a staff account.
 *
 *   node scripts/add-staff.mjs "Nombre Apellido"
 *   node scripts/add-staff.mjs "Nombre Apellido" --admin
 *
 * The PIN is typed at a hidden prompt, never passed as an argument — an
 * argument would sit in shell history and in the process list. Only the
 * scrypt digest reaches the database; the PIN itself is never stored,
 * logged, or printed.
 *
 * Run from v2/. Needs SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in
 * .env.local.
 */
import { createInterface } from "node:readline";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  let raw;
  try {
    raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  } catch {
    bail("No .env.local found. Copy .env.example to .env.local and fill it in.");
  }

  const env = {};
  for (const line of raw.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2].trim();
  }
  return env;
}

function bail(message) {
  console.error(`\n  ${message}\n`);
  process.exit(1);
}

/** Shared across prompts on the non-TTY path; see askHidden. */
let pipedLines;

/**
 * Reads a PIN without putting it on screen.
 *
 * One dot per keystroke rather than nothing at all: with no feedback there
 * is no way to tell a working prompt from a frozen one, and you find out
 * you mistyped only when the confirmation fails.
 */
function askHidden(question) {
  const { stdin, stdout } = process;

  // No TTY (piped input, some editors' terminals): fall back to a plain
  // visible prompt rather than hanging forever in raw mode. One shared
  // reader for the whole run — opening a second one would find stdin
  // already drained by the first and wait forever.
  if (!stdin.isTTY) {
    pipedLines ??= createInterface({ input: stdin })[Symbol.asyncIterator]();
    stdout.write(question);
    return pipedLines.next().then(({ value }) => {
      stdout.write("\n");
      return (value ?? "").trim();
    });
  }

  return new Promise((resolve) => {
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";

    const finish = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
      stdout.write("\n");
      resolve(value);
    };

    const onData = (chunk) => {
      // Raw mode delivers chunks, not single characters.
      for (const char of chunk) {
        if (char === "\r" || char === "\n" || char === "") {
          finish();
          return;
        }
        if (char === "") {
          // Ctrl+C: leave the terminal usable on the way out.
          stdin.setRawMode(false);
          stdout.write("\n");
          process.exit(130);
        }
        if (char === "" || char === "\b") {
          if (value.length > 0) {
            value = value.slice(0, -1);
            stdout.write("\b \b");
          }
          continue;
        }
        if (char >= " ") {
          value += char;
          stdout.write("•");
        }
      }
    };

    stdin.on("data", onData);
  });
}

const name = process.argv[2];
const role = process.argv.includes("--admin") ? "admin" : "staff";

if (!name || name.startsWith("--")) {
  bail('Usage: node scripts/add-staff.mjs "Nombre Apellido" [--admin]');
}

const env = loadEnv();
if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
  bail("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local.");
}

const pin = await askHidden(`PIN for ${name} (4-12 digits): `);
if (!/^\d{4,12}$/.test(pin)) bail("The PIN must be 4 to 12 digits.");

const again = await askHidden("Repeat the PIN: ");
if (pin !== again) bail("The two PINs do not match. Nothing was created.");

const salt = randomBytes(16);
const pinHash = `scrypt$${salt.toString("base64url")}$${scryptSync(pin, salt, 64).toString("base64url")}`;

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase
  .from("staff")
  .insert({ name, pin_hash: pinHash, role })
  .select("id, name, role")
  .single();

if (error) bail(`Could not create the account: ${error.message}`);

console.log(`\n  Created ${data.name} (${data.role}).`);
console.log(`  They can now sign in at /staff/login.\n`);
