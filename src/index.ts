import "https://deno.land/std@0.179.0/dotenv/load.ts";
import { commands } from "./commands.ts";
import { contributors } from "./config.ts";

import {
  Client,
  slash,
  event,
  Interaction,
  Intents,
  Oak,
  subslash,
} from "./deps.ts";
import { embed } from "./lib/embed.ts";

class ExistenceSMP extends Client {
  @event()
  ready() {
    console.log("Ready!");

    this.setPresence({
      name: "Community Server 2",
      type: 0,
    });

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
          thumbnail: {
            url: this.user?.avatarURL(),
          },
          description:
            "The Existence SMP Discord Bot is a multi-purpose Discord bot created for the Existence SMP Community Discord server. Use `/help` for support.",
          fields: [
            {
              name: "Contributors",
              value: contributors
                .map((x) => `<:${x.emoji.name}:${x.emoji.id}> <@${x.id}>`)
                .join("\n"),
              inline: false,
            },
            {
              name: "Deployment",
              value: `\`${Deno.hostname()}\``,
              inline: true,
            },
            {
              name: "Up Since",
              value: `<t:${Math.floor(
                (this.upSince?.getTime() || 0) / 1000
              )}:f> (<t:${Math.floor(
                (this.upSince?.getTime() || 0) / 1000
              )}:R>)`,
              inline: true,
            },
          ],
        }),
      ],
    });
  }

  @subslash("cs2", "info")
  cs2Info(i: Interaction) {
    i.reply("https://existencesmp.com/server");
  }

  @subslash("cs2")
  map(i: Interaction) {
    i.reply("https://map.existencesmp.com");
  }

  @subslash("cs2")
  screenshot(i: Interaction) {
    i.reply("Coming Soon");
  }
}

const bot = new ExistenceSMP();

bot.connect(Deno.env.get("DISCORD_TOKEN"), Intents.NonPrivileged);

// const app = new Oak.Application();

// app.use((ctx) => {
//   ctx.response.body = `Hello from ${bot.user?.username}`;
// });

// await app.listen({ port: 8080 });
