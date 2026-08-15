import { ChannelType } from "discord.js";
import type CustomClient from "../classes/CustomClient";

const BAR_LENGTH = 20;

export function getYearProgress(now: Date): { year: number; percent: number } {
    const year = now.getUTCFullYear();
    const start = Date.UTC(year, 0, 1);
    const end = Date.UTC(year + 1, 0, 1);
    const percent = ((now.getTime() - start) / (end - start)) * 100;

    return { year, percent };
}

export function buildYearProgressMessage(now: Date): string {
    const { year, percent } = getYearProgress(now);
    const filled = Math.min(BAR_LENGTH, Math.max(0, Math.round((percent / 100) * BAR_LENGTH)));
    const bar = `${"█".repeat(filled)}${"░".repeat(BAR_LENGTH - filled)}`;
    const newYear = now.getUTCMonth() === 0 && now.getUTCDate() === 1
        ? `\n${year - 1} ended!\nHappy New Year ${year}!`
        : "";

    return `||@everyone||\n${year} is ${percent.toFixed(2)}% complete!\n\`${bar}\`${newYear}`;
}

export function nextYearProgressRun(now: Date): Date {
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const fifteenth = new Date(Date.UTC(year, month, 15));

    return fifteenth.getTime() > now.getTime()
        ? fifteenth
        : new Date(Date.UTC(year, month + 1, 1));
}

export async function sendYearProgress(client: CustomClient, now = new Date()): Promise<void> {
    const configs = await client.prisma.yearProgressConfig.findMany({
        select: {
            channelId: true,
            guild: { select: { discordId: true } },
        },
    });
    const content = buildYearProgressMessage(now);

    await Promise.all(configs.map(async config => {
        try {
            const guild = client.guilds.cache.get(config.guild.discordId)
                ?? await client.guilds.fetch(config.guild.discordId);
            const channel = await guild.channels.fetch(config.channelId);

            if (!channel || channel.type !== ChannelType.GuildText) {
                console.error(
                    `Configured year progress channel ${config.channelId} is unavailable in guild ${config.guild.discordId}.`,
                );
                return;
            }

            await channel.send({
                content,
                allowedMentions: { parse: ["everyone"] },
            });
        } catch (error) {
            console.error(`Failed to send year progress for guild ${config.guild.discordId}:`, error);
        }
    }));
}

export function startYearProgressSchedule(client: CustomClient): void {
    const scheduleNext = (): void => {
        const delay = nextYearProgressRun(new Date()).getTime() - Date.now();
        const timer = setTimeout(async () => {
            try {
                await sendYearProgress(client);
            } catch (error) {
                console.error("Failed to load year progress configurations:", error);
            } finally {
                scheduleNext();
            }
        }, delay);

        timer.unref();
    };

    scheduleNext();
}
