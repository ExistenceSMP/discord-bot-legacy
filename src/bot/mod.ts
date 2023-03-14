import {
  Client,
  event,
  Interaction,
  InteractionApplicationCommandData,
  Message,
  slash,
  subslash,
} from "../deps.ts";

import {
  getLatestWeek,
  getWeeklyScreenshot,
  isValidWeek,
  setCache,
} from "../images/mod.ts";
import { isCanary } from "../index.ts";

import { embed, errorEmbed } from "../lib/embed.ts";

import { commands } from "./commands.ts";
import { contributors } from "./config.ts";

export class ExistenceSMP extends Client {
  @event()
  ready() {
    console.log("Ready!");

    if (isCanary()) {
      console.log(`[CANARY] Development environment detected`);

      this.setPresence({
        name: "for bugs",
        type: 3,
      });

      this.interactions.commands
        .bulkEdit(commands, Deno.env.get("DEV_GUILD"))
        .then((cmds) => console.log(`[CANARY] Loaded ${cmds.size} commands`))
        .catch(() => `[CANARY] Failed to load commands`);
    } else
      this.setPresence({
        name: "Community Server 2",
        type: 0,
      });

    this.interactions.commands
      .bulkEdit(commands)
      .then((cmds) => console.log(`[PROD] Loaded ${cmds.size} commands`))
      .catch(() => `[PROD] Failed to load commands`);
  }

  @event()
  messageCreate(message: Message) {
    if (
      message.channel.id == "191027546710736897" && // #chat
      message.author.id == "384428466407473153" && // mcpeachpies
      message.content.match(/Week [0-9]+ vs Week [0-9]+/g) // Week X vs Week Y
    ) {
      console.log(message.content);
      const match = (
        message.content.matchAll(/Week ([0-9]+) vs Week ([0-9]+)/g).next()
          .value as string[]
      ).slice(1);
      setCache(
        +match[1],
        message.attachments[1].proxy_url,
        `https://discord.com/channels/191027546710736897/191027546710736897/${message.id}`
      );
    }
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
                "The Existence SMP Discord Bot is a multi-purpose Discord bot created for the Existence SMP Community Discord server.",
              fields: [
                {
                  name: "Deployment",
                  value: !isCanary()
                    ? `\`${Deno.hostname()}\``
                    : `\`canary (${Deno.hostname()})\``,
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
                {
                  name: "Contributors",
                  value: contributors
                    .map((x) => `<:${x.emoji.name}:${x.emoji.id}> <@${x.id}>`)
                    .join("\n"),
                  inline: false,
                },
                {
                  name: "Useful Links",
                  value: [
                    `<:logo_existence_smp_s2:952367758820126790> [existencesmp.com](https://existencesmp.com)`,
                    `:scroll: [existencesmp.com/rules](https://existencesmp.com/rules)`,
                    "",
                    `:technologist: [Source Code](https://github.com/ExistenceSMP/existence-smp-discord-bot)`,
                    `:bug: [Bug Reports](https://github.com/ExistenceSMP/existence-smp-discord-bot/issues)`,
                  ].join("\n"),
                  inline: true,
                },
                {
                  name: "Social Media",
                  value: [
                    `<:icon_youtube:244472434172887040> [youtube.com/ExistenceSMP](https://youtube.com/ExistenceSMP)`,
                    `<:icon_twitter:244464821850996736> [twitter.com/ExistenceSMP](https://twitter.com/ExistenceSMP)`,
                    `<:icon_twitter:244464821850996736> [twitter.com/ExistenceSMPQ](https://twitter.com/ExistenceSMPQ)`,
                    `<:icon_patreon:368253238618619905> [patreon.com/ExistenceSMP](https://patreon.com/ExistenceSMP)`,
                    `<:icon_discord:244473644871450625> [existencesmp.com/discord](https://existencesmp.com/discord)`,
                  ].join("\n"),
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
