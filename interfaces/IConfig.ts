export default interface IConfig {
    token: string;
    discordClientId: string;

    devToken: string;
    devClientId: string;
    devGuildId: string;
    devUserId: string;

    // API and Google OAuth configuration
    apiBaseUrl: string;
}
