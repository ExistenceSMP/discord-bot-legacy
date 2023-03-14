import "https://deno.land/std@0.179.0/dotenv/load.ts";

import { Intents } from "./deps.ts";

import { ExistenceSMP } from "./bot/mod.ts";
import { populateCache } from "./images/mod.ts";
import { app } from "./web/mod.ts";

export const bot = new ExistenceSMP();

export const isCanary = () => Deno.env.get("DEV_GUILD") != undefined;

bot.connect(Deno.env.get("DISCORD_TOKEN"), Intents.NonPrivileged);

populateCache(bot);

app.listen({ port: 8080 });
console.log("[WEB] Web started on port 8080");
