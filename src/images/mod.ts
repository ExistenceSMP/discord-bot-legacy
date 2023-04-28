import { exists } from "https://deno.land/std@0.170.0/fs/exists.ts";

import { TextChannel } from "../deps.ts";

import { ExistenceSMP } from "../bot/mod.ts";
import { isCanary } from "../index.ts";
import { writableStreamFromWriter } from "https://deno.land/std@0.152.0/streams/conversion.ts";
import { crop } from "https://deno.land/x/aspect_ratio@v1.0.0/crop.ts";
import {
  ImageMagick,
  IMagickImage,
  initializeImageMagick,
  MagickFormat,
  MagickGeometry,
} from "https://deno.land/x/imagemagick_deno@0.0.19/mod.ts";
import { datauri } from "https://deno.land/x/datauri@v1.1.2/mod.ts";

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
  const override = (await (
    await client.guilds.fetch("1077117924751462461")
  ).channels.fetch("1086397539990900868")) as TextChannel;

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
  setBanner(client);
  console.log(`[IMAGES] 100.00% Cache Populated (${getLatestWeek()} Weeks)`);
  if (isCanary()) {
    Deno.writeTextFile("./devcache.json", JSON.stringify(weekCache));
  }

  let currentOverrideWeek = -1;
  let overrideCount = 0;
  let overrideMessages = await override.fetchMessages({
    before: override.lastMessageID,
    limit: 100,
  });
  while (currentOverrideWeek != 1) {
    overrideMessages.forEach((message) => {
      if (message.content.startsWith("Week ")) {
        currentOverrideWeek = +message.content.replace("Week ", "");
        setCache(currentOverrideWeek, message.attachments[0].proxy_url);
        overrideCount++;
      }
    });
    override.messages.flush();
    overrideMessages = await override.fetchMessages({
      before: overrideMessages.last()?.id,
      limit: 100,
    });
  }
  console.log(`[IMAGES] ${overrideCount} override images loaded`);
}

export async function setBanner(client: ExistenceSMP) {
  const guild = await client.guilds.fetch("191027546710736897");

  if (!guild.features?.includes("BANNER")) return;

  const week = getLatestWeek();
  const response = await fetch(getWeeklyScreenshot(week).imageUrl);
  console.log(`[IMAGES] Setting banner to Week ${week}`);
  if (response.body) {
    const file = await Deno.open("./banner.png", {
      write: true,
      create: true,
    });
    const writableStream = writableStreamFromWriter(file);
    await response.body.pipeTo(writableStream);

    const image = await Deno.readFile("./banner.png");

    const newCrop = crop(4112, 2572, "16:9");

    await initializeImageMagick();

    ImageMagick.read(image, (img: IMagickImage) => {
      img.crop(
        new MagickGeometry(newCrop[0], newCrop[1], newCrop[2], newCrop[3])
      );
      img.resize(1920, 1080);
      img.write(
        (data: Uint8Array) => Deno.writeFile("./banner.png", data),
        MagickFormat.Png
      );
    });
  }

  await guild.edit({
    banner: null,
  });

  await guild.edit({
    banner: await datauri("./banner.png"),
  });
  console.log(guild.banner);
}

export function setCache(week: number, imageUrl: string, messageUrl?: string) {
  weekCache[week] = {
    imageUrl,
    messageUrl: messageUrl || getWeeklyScreenshot(week).messageUrl,
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
