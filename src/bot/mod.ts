import {
  Client,
  event,
  Interaction,
  InteractionApplicationCommandData,
  slash,
  subslash,
} from "../deps.ts";

import {
  getLatestWeek,
  getWeeklyScreenshot,
  isValidWeek,
} from "../images/mod.ts";

import { embed, errorEmbed } from "../lib/embed.ts";

import { commands } from "./commands.ts";
import { contributors } from "./config.ts";

export class ExistenceSMP extends Client {
  @event()
  ready() {
    console.log("Ready!");

    this.setPresence({
      name: "Community Server 2",
      type: 0,
    });

    if (Deno.env.get("DEV_GUILD")) {
      console.log(`[DEV] Development environment detected`);
      this.interactions.commands
        .bulkEdit(commands, Deno.env.get("DEV_GUILD"))
        .then((cmds) => console.log(`[DEV] Loaded ${cmds.size} commands`))
        .catch(() => `[DEV] Failed to load commands`);
    } else
      this.interactions.commands
        .bulkEdit(commands)
        .then((cmds) => console.log(`[GLOBAL] Loaded ${cmds.size} commands`))
        .catch(() => `[GLOBAL] Failed to load commands`);
  }

  @slash()
  info(i: Interaction) {
    switch (
      (i.data as InteractionApplicationCommandData).options
        ? (i.data as InteractionApplicationCommandData).options[0].value
        : "bot"
    ) {
      case "cs2": {
        i.reply("https://existencesmp.com/server");
        break;
      }
      case "projectcreate": {
        i.reply("https://existencesmp.com/server/create");
        break;
      }
      default: {
        i.reply({
          embeds: [
            embed("Existence SMP Discord Bot", {
              thumbnail: {
                url: this.user?.avatarURL(),
              },
              image: {
                url: getWeeklyScreenshot(getLatestWeek()).imageUrl,
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
        break;
      }
    }
  }

  @slash()
  map(i: Interaction) {
    switch ((i.data as InteractionApplicationCommandData).options[0].value) {
      case "cs2": {
        i.reply("https://map.existencesmp.com");
        break;
      }
      case "projectcreate": {
        i.reply({
          embeds: [
            errorEmbed({
              description:
                "The Project Create Online Map is currently unavailable.",
            }),
          ],
        });
        break;
      }
      default: {
        i.reply({
          embeds: [errorEmbed({ description: "Please specify a server." })],
          ephemeral: true,
        });
        break;
      }
    }
  }

  @slash()
  screenshot(i: Interaction) {
    const data = i.data as InteractionApplicationCommandData;

    const week = data.options
      ? (data.options.find((x) => x.name == "week")?.value as number)
      : getLatestWeek();
    const compareTo = data.options
      ? (data.options.find((x) => x.name == "compare_to")?.value as number)
      : undefined;

    if (isValidWeek(week)) {
      if (compareTo && isValidWeek(compareTo)) {
        const screenshotOne = getWeeklyScreenshot(week);
        const screenshotTwo = getWeeklyScreenshot(compareTo);

        i.reply({
          embeds: [
            embed(`Week ${week} vs Week ${compareTo}`, {
              url: `https://existencesmp.com/server`,
              description: `[Jump to Week ${week}](${screenshotOne.messageUrl})\n[Jump to Week ${compareTo}](${screenshotTwo.messageUrl})`,
              image: {
                url: screenshotOne.imageUrl,
              },
            }),
            embed(`Week ${week} vs Week ${compareTo}`, {
              url: `https://existencesmp.com/server`,
              image: {
                url: screenshotTwo.imageUrl,
              },
            }),
          ],
        });
      } else {
        const screenshot = getWeeklyScreenshot(week);

        i.reply({
          embeds: [
            embed(`Week ${week}`, {
              description: `[Jump to Week ${week}](${screenshot.messageUrl})`,
              image: {
                url: screenshot.imageUrl,
              },
            }),
          ],
        });
      }
    } else {
      i.reply({
        embeds: [errorEmbed({ description: `Week ${week} is not valid` })],
      });
    }
  }
}
