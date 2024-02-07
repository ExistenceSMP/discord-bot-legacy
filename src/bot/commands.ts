import { SlashCommandPartial, SlashCommandOptionType } from "../deps.ts";

export const commands: SlashCommandPartial[] = [
  {
    name: "info",
    description: "View useful information about Existence SMP",
    options: [
      {
        name: "topic",
        description: "The topic to view information about (default: bot)",
        choices: [
          {
            name: "Bot",
            value: "bot",
          },
          {
            name: "Community Server 2",
            value: "cs2",
          }
        ],
        type: SlashCommandOptionType.STRING,
        required: false,
      },
    ],
  },
  {
    name: "map",
    description: "View the online map for a server",
    options: [
      {
        name: "server",
        description: "The server to view the online map for",
        choices: [
          {
            name: "Community Server 2",
            value: "cs2",
          }
        ],
        type: SlashCommandOptionType.STRING,
        required: true,
      },
    ],
  },
  {
    name: "screenshot",
    description: "View the weekly screenshots for Community Server 2",
    options: [
      {
        name: "week",
        description:
          "The week to view the weekly screenshot for (default latest)",
        type: SlashCommandOptionType.INTEGER,
        minValue: 0,
        autocomplete: true,
      },
      {
        name: "compare_to",
        description: "The week to compare to",
        type: SlashCommandOptionType.INTEGER,
        minValue: 0,
        autocomplete: true,
      },
    ],
  },
];
