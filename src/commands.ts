import { SlashCommandPartial, SlashCommandOptionType } from "./deps.ts";

export const commands: SlashCommandPartial[] = [
  {
    name: "info",
    description: "View useful information about the Existence SMP Discord bot",
    options: [],
  },
  {
    name: "cs2",
    description: "Commands relating to the Existence SMP Community Server 2",
    options: [
      {
        name: "info",
        description: "View basic info about Community Server 2",
        type: SlashCommandOptionType.SUB_COMMAND,
      },
      {
        name: "map",
        description: "View the Community Server 2 online map",
        type: SlashCommandOptionType.SUB_COMMAND,
      },
      {
        name: "screenshot",
        description: "View the Community Server 2 weekly screenshots",
        type: SlashCommandOptionType.SUB_COMMAND,
        options: [
          {
            name: "week",
            description:
              "Specify the week number of the screenshot (default latest)",
            type: SlashCommandOptionType.INTEGER,
            required: false,
          },
        ],
      },
    ],
  },
];
