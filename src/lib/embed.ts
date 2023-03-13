import { Embed, EmbedPayload } from "../deps.ts";

export const embed = (data: EmbedPayload) =>
  new Embed({ color: 2253838, ...data });
