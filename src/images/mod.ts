import { exists } from "https://deno.land/std@0.170.0/fs/exists.ts";

import { TextChannel } from "../deps.ts";

import { ExistenceSMP } from "../bot/mod.ts";
import { isCanary } from "../index.ts";

interface WeeklyScreenshot {
  imageUrl: string;
  messageUrl: string;
}

export let weekCache: { [key: number]: WeeklyScreenshot } = {};

export async function populateCache(client: ExistenceSMP) {
  if (
    isCanary() &&
    (await exists("./devcache.json")) &&
    (await Deno.readTextFile("./devcache.json")) != ""
  ) {
    weekCache = JSON.parse(await Deno.readTextFile("./devcache.json"));
  }

  const chat = (await (
    await client.guilds.fetch("191027546710736897")
  ).channels.fetch("191027546710736897")) as TextChannel;

  let currentWeek = -1;
  let messages = await chat.fetchMessages({
    before: chat.lastMessageID,
    limit: 100,
  });
  while (currentWeek != 1) {
    messages.forEach((message) => {
      if (
        message.author.id == "384428466407473153" &&
        message.content.match(/Week [0-9]+ vs Week [0-9]+/g) // Week X vs Week Y
      ) {
        const match = (
          message.content.matchAll(/Week ([0-9]+) vs Week ([0-9]+)/g).next()
            .value as string[]
        ).slice(1);
        currentWeek = +match[1];
        if (
          isCanary() &&
          weekCache[currentWeek] &&
          weekCache[currentWeek].imageUrl == message.attachments[1].proxy_url
        )
          return (currentWeek = 1);
        weekCache[currentWeek] = {
          imageUrl: message.attachments[1].proxy_url,
          messageUrl: `https://discord.com/channels/191027546710736897/191027546710736897/${message.id}`,
        };
        if (currentWeek == 1) {
          weekCache[0] = {
            imageUrl: message.attachments[0].proxy_url,
            messageUrl: `https://discord.com/channels/191027546710736897/191027546710736897/${message.id}`,
          };
        } else if (currentWeek == 36) {
          weekCache[35] = {
            imageUrl: message.attachments[0].proxy_url,
            messageUrl: `https://discord.com/channels/191027546710736897/191027546710736897/${message.id}`,
          };
        }
      }
    });
    chat.messages.flush();
    messages = await chat.fetchMessages({
      before: messages.last()?.id,
      limit: 100,
    });
    console.log(
      "[IMAGES]",
      (
        ((+Object.keys(weekCache)[Object.keys(weekCache).length - 1] -
          currentWeek) /
          +Object.keys(weekCache)[Object.keys(weekCache).length - 1]) *
        100
      ).toFixed(2) + "% Cache Populated"
    );
  }
  console.log(`[IMAGES] 100.00% Cache Populated (${getLatestWeek()} Weeks)`);
  if (isCanary()) {
    Deno.writeTextFile("./devcache.json", JSON.stringify(weekCache));
  }
}

export function setCache(week: number, imageUrl: string, messageUrl: string) {
  weekCache[week] = {
    imageUrl,
    messageUrl,
  };
}

export function getWeeklyScreenshot(week: number) {
  return weekCache[week];
}

export function getLatestWeek() {
  return +Object.keys(weekCache)[Object.keys(weekCache).length - 1];
}

export function isValidWeek(week: number) {
  return weekCache[week] != undefined;
}
