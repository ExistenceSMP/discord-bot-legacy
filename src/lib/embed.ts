import { Embed, EmbedPayload } from "../deps.ts";

export const embed = (title: string, data: EmbedPayload) =>
  new Embed({
    color: 2253838,
    author: {
      icon_url:
        "https://cdn.discordapp.com/attachments/1084782928648744962/1085041770410291251/existence_ok.png",
      name: title,
    },
    ...data,
  });

export const errorEmbed = (data: EmbedPayload) =>
  new Embed({
    color: 9240576,
    author: {
      icon_url:
        "https://cdn.discordapp.com/attachments/1084782928648744962/1085044061477543948/existence_error.png",
      name: "Error",
    },
    ...data,
  });
