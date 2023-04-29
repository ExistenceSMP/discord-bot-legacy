import {
  ActionRowComponent,
  ApplicationCommandInteraction,
  autocomplete,
  AutocompleteInteraction,
  ButtonComponent,
  Client,
  event,
  Interaction,
  InteractionMessageComponentData,
  InteractionType,
  Message,
  MessageComponentInteraction,
  slash,
  ThreadChannel,
  cron,
} from "../deps.ts";
import dayjs from "npm:dayjs@1.11.7";
import weekday from "npm:dayjs@1.11.7/plugin/weekday.js";
import timezone from "npm:dayjs@1.11.7/plugin/timezone.js";

import {
  getLatestWeek,
  getWeeklyScreenshot,
  isValidWeek,
  setBanner,
  setCache,
  weekCache,
} from "../images/mod.ts";
import { isCanary } from "../index.ts";

import { embed, errorEmbed } from "../lib/embed.ts";

import { commands } from "./commands.ts";
import { contributors } from "./config.ts";

dayjs.extend(weekday);
dayjs.extend(timezone);
dayjs.tz.setDefault("America/Los_Angeles");

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
        .bulkEdit([])
        .then(() => console.log(`[CANARY] Flushed global commands`))
        .catch(() => console.log(`[CANARY] Failed to flush global commands`));
      this.interactions.commands
        .bulkEdit(commands, Deno.env.get("DEV_GUILD"))
        .then((cmds) => console.log(`[CANARY] Loaded ${cmds.size} commands`))
        .catch(() => `[CANARY] Failed to load commands`);
    } else {
      this.setPresence({
        name: "Community Server 2",
        type: 0,
      });

      this.interactions.commands
        .bulkEdit(commands)
        .then((cmds) => console.log(`[PROD] Loaded ${cmds.size} commands`))
        .catch(() => `[PROD] Failed to load commands`);
    }

    cron(
      `0 ${new Date(946731600).getHours()} * * WED`,
      this.waddleDeeWednesday
    );
  }

  async waddleDeeWednesday() {
    const thread = (await (
      await this.guilds.fetch("191027546710736897")
    ).channels.fetch("1070341143168032798")) as ThreadChannel;

    await thread.send(`<@244236398348075010>`, {
      embeds: [
        embed("Happy Waddle-Dee Wednesday!", {
          image: {
            url: "https://cdn.discordapp.com/attachments/1070341143168032798/1080487507709395089/IMG_5545.jpg",
          },
        }),
      ],
    });
  }

  @event()
  messageCreate(message: Message) {
    if (
      message.channel.id == "191027546710736897" && // #chat
      message.author.id == "384428466407473153" && // mcpeachpies
      message.content.match(/Week [0-9]+ vs Week [0-9]+/g) // Week X vs Week Y
    ) {
      const match = (
        message.content.matchAll(/Week ([0-9]+) vs Week ([0-9]+)/g).next()
          .value as string[]
      ).slice(1);
      setCache(
        +match[1],
        message.attachments[1].proxy_url,
        `https://discord.com/channels/191027546710736897/191027546710736897/${message.id}`
      );
      setTimeout(() => {
        setBanner(this);
      }, 1000);
    }

    setTimeout(async () => {
      if (
        (["343903465686433793", "380478569240854528"].includes(
          message.channelID
        ) ||
          isCanary()) &&
        message.embeds.length > 0
      ) {
        console.log(message.embeds);
        const video = message.embeds.find((x) => x.type == "video");

        if (video) {
          const isTwitch = video.url?.toLowerCase().includes("twitch");
          const isStream =
            isTwitch ||
            video.url?.toLowerCase().includes("live") ||
            video.title?.toLowerCase().includes("live") ||
            video.description?.toLowerCase().includes("live");

          if (isStream) {
            if (isTwitch) {
              const thread = await message.startThread({
                name: "🔴 " + video.description!.slice(0, 198),
                autoArchiveDuration: 1440,
              });

              thread.send(
                `Welcome to the discussion thread for ${message.author.mention}'s livestream, **${video.description}**! This message is the start of the thread.\n\n*You are welcome to close the thread if you believe it was created by mistake.*`
              );
            } else {
              const thread = await message.startThread({
                name: "🔴 " + video.title!.slice(0, 198),
                autoArchiveDuration: 1440,
              });

              thread.send(
                `Welcome to the discussion thread for ${message.author.mention}'s livestream, **${video.title}**! This message is the start of the thread.\n\n*You are welcome to close the thread if you believe it was created by mistake.*`
              );
            }
          } else {
            const thread = await message.startThread({
              name: "🎥 " + video.title!.slice(0, 198),
              autoArchiveDuration: 1440,
            });

            thread.send(
              `Welcome to the discussion thread for ${message.author.mention}'s new video, **${video.title}**! This message is the start of the thread.\n\n*You are welcome to close the thread if you believe it was created by mistake.*`
            );
          }
        }
      }
    }, 1000);
  }

  @event()
  interactionCreate(i: Interaction) {
    if (i.type == InteractionType.MESSAGE_COMPONENT) {
      const customId = (i.data as InteractionMessageComponentData).custom_id;
      if (customId == "screenshot_next") {
        const message = i.message!;
        const currentWeek = +(
          (message.components[0] as ActionRowComponent).components.find(
            (x) => (x as ButtonComponent).customID == "screenshot_current"
          )! as ButtonComponent
        ).label.replace("Week ", "");
        const newWeek = currentWeek + 1;
        if (isValidWeek(newWeek)) {
          const screenshot = getWeeklyScreenshot(newWeek);

          (i as MessageComponentInteraction).updateMessage({
            embeds: [
              embed(`Weekly Screenshot`, {
                description: `Jump to [Week ${newWeek}](${screenshot.messageUrl})`,
                image: {
                  url: screenshot.imageUrl,
                },
              }),
            ],
            components: [
              {
                type: "ACTION_ROW",
                components: [
                  {
                    type: "BUTTON",
                    style: "PRIMARY",
                    label: `⬅️ Week ${newWeek - 1}`,
                    customID: `screenshot_previous`,
                    disabled: !isValidWeek(newWeek - 1),
                  },
                  {
                    type: "BUTTON",
                    style: "GREY",
                    label: `Week ${newWeek}`,
                    customID: `screenshot_current`,
                    disabled: true,
                  },
                  {
                    type: "BUTTON",
                    style: "PRIMARY",
                    label: `Week ${newWeek + 1} ➡️`,
                    customID: `screenshot_next`,
                    disabled: !isValidWeek(newWeek + 1),
                  },
                ],
              },
            ],
          });
        } else {
          (i as MessageComponentInteraction).updateMessage({});
        }
      } else if (customId == "screenshot_previous") {
        const message = i.message!;
        const currentWeek = +(
          (message.components[0] as ActionRowComponent).components.find(
            (x) => (x as ButtonComponent).customID == "screenshot_current"
          )! as ButtonComponent
        ).label.replace("Week ", "");
        const newWeek = currentWeek - 1;
        if (isValidWeek(newWeek)) {
          const screenshot = getWeeklyScreenshot(newWeek);

          (i as MessageComponentInteraction).updateMessage({
            embeds: [
              embed(`Weekly Screenshot`, {
                description: `Jump to [Week ${newWeek}](${screenshot.messageUrl})`,
                image: {
                  url: screenshot.imageUrl,
                },
              }),
            ],
            components: [
              {
                type: "ACTION_ROW",
                components: [
                  {
                    type: "BUTTON",
                    style: "PRIMARY",
                    label: `⬅️ Week ${newWeek - 1}`,
                    customID: `screenshot_previous`,
                    disabled: !isValidWeek(newWeek - 1),
                  },
                  {
                    type: "BUTTON",
                    style: "GREY",
                    label: `Week ${newWeek}`,
                    customID: `screenshot_current`,
                    disabled: true,
                  },
                  {
                    type: "BUTTON",
                    style: "PRIMARY",
                    label: `Week ${newWeek + 1} ➡️`,
                    customID: `screenshot_next`,
                    disabled: !isValidWeek(newWeek + 1),
                  },
                ],
              },
            ],
          });
        } else {
          (i as MessageComponentInteraction).updateMessage({});
        }
      }
    }
  }

  @slash()
  info(i: ApplicationCommandInteraction) {
    switch (i.data.options ? i.data.options[0].value : "bot") {
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
                  name: "Useful Links",
                  value: [
                    `<:logo_existence_smp_s2:952367758820126790> [Website](https://existencesmp.com)`,
                    `:scroll: [Rules](https://existencesmp.com/rules)`,
                    "",
                    `:technologist: [Source Code](https://github.com/ExistenceSMP/existence-smp-discord-bot)`,
                    `:bug: [Bug Reports](https://github.com/ExistenceSMP/existence-smp-discord-bot/issues)`,
                  ].join("\n"),
                  inline: true,
                },
                {
                  name: "Contributors",
                  value: contributors
                    .map((x) => `<:${x.emoji.name}:${x.emoji.id}> <@${x.id}>`)
                    .join("\n"),
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
                  inline: false,
                },
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
              ],
            }),
          ],
        });
        break;
      }
    }
  }

  @slash()
  map(i: ApplicationCommandInteraction) {
    switch (i.data.options[0].value) {
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
  async screenshot(i: ApplicationCommandInteraction) {
    const { data } = i;

    const week =
      data.options && data.options.find((x) => x.name == "week")
        ? (data.options.find((x) => x.name == "week")?.value as number)
        : getLatestWeek();
    const compareTo =
      data.options && data.options.find((x) => x.name == "compare_to")
        ? (data.options.find((x) => x.name == "compare_to")?.value as number)
        : undefined;

    if (isValidWeek(week)) {
      if (compareTo != undefined && isValidWeek(compareTo)) {
        const screenshotOne = getWeeklyScreenshot(week);
        const screenshotTwo = getWeeklyScreenshot(compareTo);

        i.reply({
          embeds: [
            embed(`Weekly Screenshot`, {
              url: `https://existencesmp.com/server`,
              description: `Jump to [Week ${week}](${screenshotOne.messageUrl}) vs [Week ${compareTo}](${screenshotTwo.messageUrl})`,
              image: {
                url: screenshotOne.imageUrl,
              },
            }),
            embed(`Weekly Screenshot`, {
              url: `https://existencesmp.com/server`,
              image: {
                url: screenshotTwo.imageUrl,
              },
            }),
          ],
        });
      } else {
        const screenshot = getWeeklyScreenshot(week);

        await i.reply({
          embeds: [
            embed(`Weekly Screenshot`, {
              description: `Jump to [Week ${week}](${screenshot.messageUrl})`,
              image: {
                url: screenshot.imageUrl,
              },
            }),
          ],
        });
        const response = await i.fetchResponse();
        i.editResponse({
          embeds: response.embeds,
          components: [
            {
              type: "ACTION_ROW",
              components: [
                {
                  type: "BUTTON",
                  style: "PRIMARY",
                  label: `⬅️ Week ${week - 1}`,
                  customID: `screenshot_previous`,
                  disabled: !isValidWeek(week - 1),
                },
                {
                  type: "BUTTON",
                  style: "GREY",
                  label: `Week ${week}`,
                  customID: `screenshot_current`,
                  disabled: true,
                },
                {
                  type: "BUTTON",
                  style: "PRIMARY",
                  label: `Week ${week + 1} ➡️`,
                  customID: `screenshot_next`,
                  disabled: !isValidWeek(week + 1),
                },
              ],
            },
          ],
        });
      }
    } else {
      i.reply({
        embeds: [errorEmbed({ description: `Week \`${week}\` is not valid` })],
      });
    }
  }

  @autocomplete("screenshot", "week")
  screenshotWeekCompletion(i: AutocompleteInteraction) {
    return i.autocomplete(
      Object.keys(weekCache)
        .map((x) => ({ name: x, value: +x }))
        .filter((x) =>
          x.name.startsWith(i.data.options.find((x) => x.name == "week")!.value)
        )
        .slice(0, 25)
    );
  }

  @autocomplete("screenshot", "compare_to")
  screenshotCompareToCompletion(i: AutocompleteInteraction) {
    return i.autocomplete(
      Object.keys(weekCache)
        .map((x) => ({ name: x, value: +x }))
        .filter((x) =>
          x.name.startsWith(
            i.data.options.find((x) => x.name == "compare_to")!.value
          )
        )
        .slice(0, 25)
    );
  }
}
