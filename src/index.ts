import "https://deno.land/std@0.179.0/dotenv/load.ts";
import { commands } from "./commands.ts";

import { Client, slash, event, Interaction, Intents } from "./deps.ts";
import { embed } from "./lib/embed.ts";

class ExistenceSMP extends Client {
  @event()
  ready() {
    console.log("Ready!");
    if (Deno.env.get("DEV_GUILD"))
      this.interactions.commands
        .bulkEdit(commands, Deno.env.get("DEV_GUILD"))
        .then((cmds) => console.log(`[DEV] Loaded ${cmds.size} commands`))
        .catch(() => `[DEV] Failed to load commands`);
    this.interactions.commands
      .bulkEdit(commands)
      .then((cmds) => console.log(`[GLOBAL] Loaded ${cmds.size} commands`))
      .catch(() => `[GLOBAL] failed to load commands`);
  }

  @slash()
  info(i: Interaction) {
    i.reply({
      embeds: [
        embed({
          title: "Existence SMP Discord Bot",
          description:
            "The Existence SMP Discord Bot is a multi-purpose Discord bot created for the Existence SMP Community Discord server. Use `/help` for support.",
          fields: [
            {
              name: "Contributors",
              value: "",
              inline: false,
            },
            {
              name: "Deployment",
              value: "dev",
              inline: true,
            },
            {
              name: "Up Since",
              value: `<t:${Math.floor(
                (this.upSince?.getTime() || 0) / 1000
              )}:f> (<t:${Math.floor(
                (this.upSince?.getTime() || 0) / 1000
              )}:R>))`,
              inline: true,
            },
          ],
        }),
      ],
      ephemeral: true,
    });
  }
}

const bot = new ExistenceSMP();

bot.connect(Deno.env.get("DISCORD_TOKEN"), Intents.NonPrivileged);
