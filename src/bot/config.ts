import { EmojiPayload } from "../deps.ts";

interface Contributor {
  id: string;
  emoji: EmojiPayload;
}

export const contributors: Contributor[] = [
  {
    id: "182292736790102017",
    emoji: {
      name: "iGalaxy",
      id: "1085089904448507914",
    },
  },
  {
    id: "159704489970892800",
    emoji: {
      name: "Jippertje",
      id: "1085089903165046804",
    },
  },
];
