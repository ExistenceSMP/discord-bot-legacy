import { Oak } from "../deps.ts";

import {
  getLatestWeek,
  getWeeklyScreenshot,
  weekCache,
} from "../images/mod.ts";

export const app = new Oak.Application();

app.use(async (ctx) => {
  if (ctx.request.url.pathname == "/latest") {
    const image = await fetch(getWeeklyScreenshot(getLatestWeek()).imageUrl);

    const headers = new Headers();
    headers.set("Content-Type", image.headers.get("Content-Type")!);
    headers.set("Access-Control-Allow-Origin", "*");

    ctx.response.status = 200;
    ctx.response.body = image.body;
    ctx.response.headers = headers;
  } else {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Access-Control-Allow-Origin", "*");

    ctx.response.status = 200;
    ctx.response.body = {
      data: Object.keys(weekCache).map((x) => weekCache[+x]),
    };
    ctx.response.headers = headers;
  }
});
