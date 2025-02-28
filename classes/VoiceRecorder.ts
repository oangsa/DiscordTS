import type { VoiceConnection } from '@discordjs/voice';
import { AudioReceiveStream, EndBehaviorType } from '@discordjs/voice';
import ffmpeg, { FfmpegCommand, type FilterSpecification } from 'fluent-ffmpeg';
import { resolve } from 'path';
import { ReplayReadable } from './ReplayReadable';
import type { AudioExportType, DiscordClientInterface, RecordOptions, SocketServerConfig, UserStreams, UserVolumesDict } from '../interfaces/IVoiceRecorder';
import { PassThrough, Readable, Writable } from 'stream';
import * as net from 'net';
import { Server } from 'net';
import { randomUUID } from 'crypto';
import archiver from 'archiver';
import { platform, tmpdir } from 'os';
import type IVoiceRecorder from '../interfaces/IVoiceRecorder';


export default class VoiceRecorder implements IVoiceRecorder {
    private readonly options: RecordOptions;
    private static readonly PCM_FORMAT = 's16le';
    private static readonly tempPath = tmpdir();
    private writeStreams: Record<string, {
        userStreams: UserStreams,
        listener: (userId: string) => void;
    } | undefined> = {};

    constructor(options: Partial<RecordOptions> = {}, private discordClient?: DiscordClientInterface) {
        this.options = {
            maxUserRecordingLength: (options.maxUserRecordingLength ?? 100) * 1_024 * 1_024,
            maxRecordTimeMinutes: (options.maxRecordTimeMinutes ?? 10) * 60 * 1_000,
            sampleRate: (options.sampleRate ?? 16_000),
            channelCount: (options.channelCount ?? 2)
        };
    }

    public isRecording(guildId?: string): boolean {
        if(guildId) {
            return !!this.writeStreams[guildId];
        }
        return !!Object.keys(this.writeStreams).length;
    }

    public startRecording(connection: VoiceConnection): void {
        const guildId = connection.joinConfig.guildId;

        console.log(`Recording started for server: ${guildId}`);

        if (this.writeStreams[guildId]) {
            return;
        }
        const listener = (userId: string) => {
            const streams:  {source: AudioReceiveStream, out: ReplayReadable} | undefined = this.writeStreams[guildId]?.userStreams[userId];
            if(streams) {
                return;
            }
            this.startRecordStreamOfUser(guildId, userId, connection);
        }
        this.writeStreams[guildId] = {
            userStreams: {},
            listener,
        };
        connection.receiver.speaking.on('start', listener);
    }

    private startRecordStreamOfUser(guildId: string, userId: string, connection: VoiceConnection): void {
        const serverStream = this.writeStreams[guildId];
        if(!serverStream) {
            return;
        }

        const recordStream = new ReplayReadable(this.options.maxRecordTimeMinutes, this.options.sampleRate, this.options.channelCount, ()=>  connection.receiver.speaking.users.get(userId), {
            highWaterMark: this.options.maxUserRecordingLength,
            length: this.options.maxUserRecordingLength
        });
        const opusStream = connection.receiver.subscribe(userId, {
            end: {
                behavior: EndBehaviorType.AfterSilence,
                duration: this.options.maxRecordTimeMinutes,
            },
        });

        opusStream.on('error', (error: Error) => {
            console.error(error, `Error while recording voice for user ${userId} in server: ${guildId}`);
        });

        opusStream.on('end', () => {
            this.stopUserRecording(guildId, userId);
        });

        opusStream.pipe(recordStream, {end: false});

        serverStream.userStreams[userId] = { out: recordStream, source: opusStream };
    }

    public stopRecording(connection: VoiceConnection): void {
        const guildId = connection.joinConfig.guildId;
        const serverStreams = this.writeStreams[guildId];
        if(!serverStreams) {
            return;
        }
        connection.receiver.speaking.removeListener('start', serverStreams.listener);

        for (const userId in serverStreams.userStreams) {
            this.stopUserRecording(guildId, userId);
        }
        delete this.writeStreams[guildId];
    }

    private stopUserRecording(guildId: string, userId: string): void {
        const serverStreams = this.writeStreams[guildId];
        if(!serverStreams) {
            return;
        }
        const userStream = serverStreams.userStreams[userId];
        if(!userStream) {
            return;
        }
        userStream.source.destroy();
        userStream.out.destroy();
        delete serverStreams.userStreams[userId];
    }

    public async getRecordedVoice<T extends Writable>(writeStream: T, guildId: string, exportType: AudioExportType = 'single', minutes = 10, userVolumes: UserVolumesDict = {}): Promise<boolean> {
        const serverStream = this.writeStreams[guildId];
        if (!serverStream) {
            console.warn(`server with id ${guildId} does not have any streams`, 'Record voice');
            return false;
        }
        const minStartTimeMs = this.getMinStartTime(guildId);

        if (!minStartTimeMs) {
            return false;
        }

        const recordDurationMs = Math.min(Math.abs(minutes) * 60 * 1_000, this.options.maxRecordTimeMinutes);
        const endTimeMs = Date.now();
        const maxRecordTime = endTimeMs - recordDurationMs;
        const startRecordTime = Math.max(minStartTimeMs, maxRecordTime);
        const recordMethod = (exportType === 'single' ? this.generateMergedRecording : this.generateSplitRecording).bind(this);

        return recordMethod(serverStream.userStreams, startRecordTime, endTimeMs, writeStream, userVolumes);
    }

    public async getRecordedVoiceAsBuffer(guildId: string, exportType: AudioExportType = 'single', minutes = 10, userVolumes: UserVolumesDict = {}): Promise<Buffer> {
        const bufferStream = new PassThrough();
        const buffers: Buffer[] = [];
        const bufferPromise = new Promise((resolve) => {
            bufferStream.on('finish', resolve);
            bufferStream.on('error', resolve);
        });

        bufferStream.on('data', (data) => {
            buffers.push(data);
        });

        const result = await this.getRecordedVoice(bufferStream, guildId, exportType, minutes, userVolumes);
        if(!result) {
            return Buffer.from([]);
        }
        await bufferPromise;
        return Buffer.concat(buffers);
    }

    public getRecordedVoiceAsReadable(guildId: string, exportType: AudioExportType = 'single', minutes = 10, userVolumes: UserVolumesDict = {}): Readable {
        const passThrough = new PassThrough({allowHalfOpen: true});
        void this.getRecordedVoice(passThrough, guildId, exportType, minutes, userVolumes);
        return passThrough;
    }

    private generateMergedRecording(userStreams: UserStreams, startRecordTime: number, endTime: number, writeStream: Writable, userVolumes?: UserVolumesDict): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const {command, openServers} = this.getFfmpegSpecs(userStreams, startRecordTime, endTime, userVolumes);
            if (!openServers.length) {
                return resolve(false);
            }
            command
                .on('end', () => {
                    openServers.forEach(server => server.close());
                    resolve(true);
                })
                .on('error', (error) => {
                    openServers.forEach(server => server.close());
                    reject(error);
                })
                .outputFormat('mp3')
                .writeToStream(writeStream, {end: true});
        });
    }

    private async generateSplitRecording(userStreams: UserStreams, startRecordTime: number, endTime: number, writeStream: Writable, userVolumes?: UserVolumesDict): Promise<boolean> {
        const archive = archiver('zip');
        const userIds = Object.keys(userStreams);
        if (!userIds.length) {
            return false;
        }
        for (const userId of userIds) {
            const passThroughStream = this.getUserRecordingStream(userStreams[userId]!.out.rewind(startRecordTime, endTime), userId, userVolumes);
            const username = await this.getUsername(userId);
            archive.append(passThroughStream, {
                name: `${username}.mp3`
            });
        }

        return new Promise((resolve, reject) => {
            archive
                .on('end', () => resolve(true))
                .on('error', reject)
                .pipe(writeStream, {end: true});
            archive.finalize();
        });
    }

    private async getUsername(userId: string): Promise<string> {
        if (this.discordClient) {
            try {
                const { username } = await this.discordClient.users.fetch(userId);
                return username;
            } catch (error) {
                console.error(`Username of userId: ${userId} can't be fetched!`, error);
            }
        }
        return userId;
    }

    private getUserRecordingStream(stream: Readable, userId: string, userVolumes?: UserVolumesDict): PassThrough {
        const passThroughStream = new PassThrough({allowHalfOpen: false});

        ffmpeg(stream)
            .inputOptions(this.getRecordInputOptions())
            .audioFilters([
                {
                    filter: 'volume',
                    options: ((this.getUserVolume(userId, userVolumes)) / 100).toString(),
                }
            ]
            )
            .outputFormat('mp3')
            .output(passThroughStream, {end: true})
            .run();
        return passThroughStream;
    }

    private getUserVolume(userId: string, userVolumes?: UserVolumesDict): number {
        return userVolumes?.[userId] ?? 100;
    }

    private getMinStartTime(guildId: string): number | undefined {
        let minStartTime: number | undefined;
        const userStreams: UserStreams = this.writeStreams[guildId]?.userStreams ?? {};

        for (const userId in userStreams) {
            const startTime = userStreams[userId]!.out.startTimeMs;

            if (!minStartTime || (startTime < minStartTime)) {
                minStartTime = startTime;
            }
        }
        return minStartTime;
    }

    private getFfmpegSpecs(streams: UserStreams, startRecordTime: number, endTimeMs: number, userVolumesDict?: UserVolumesDict): { command: FfmpegCommand, openServers: Server[] } {
        let ffmpegOptions = ffmpeg();
        const amixStrings: string[] = [];
        const volumeFilter: FilterSpecification[] = [];
        const openServers: Server[] = [];

        for (const userId in streams) {
            const stream = streams[userId]!.out;
            try {
                const output = `[s${volumeFilter.length}]`;
                const {server, url} = this.serveStream(stream, startRecordTime, endTimeMs);

                ffmpegOptions = ffmpegOptions
                    .addInput(url)
                    .inputOptions(this.getRecordInputOptions());

                volumeFilter.push({
                    filter: 'volume',
                    options: [(this.getUserVolume(userId, userVolumesDict) / 100).toString()],
                    inputs: `${volumeFilter.length}:0`,
                    outputs: output,
                });
                openServers.push(server);
                amixStrings.push(output);
            } catch (e) {
                console.error(e as Error, 'Error while saving user recording');
            }
        }

        return {
            command: ffmpegOptions.complexFilter([
                ...volumeFilter,
                {
                    filter: `amix=inputs=${volumeFilter.length}`,
                    inputs: amixStrings.join(''),
                }
            ]),
            openServers,
        }
    }

    private getRecordInputOptions(): string[] {
        return [`-f ${VoiceRecorder.PCM_FORMAT}`, `-ar ${this.options.sampleRate}`, `-ac ${this.options.channelCount}`];
    }

    private serveStream(stream: ReplayReadable, startRecordTime: number, endTimeMs: number): SocketServerConfig {
        let socketPath: string, url: string;

        if(platform() === 'win32') {
            socketPath = url = `\\\\.\\pipe\\${randomUUID()}`;
        } else {
            socketPath = resolve(VoiceRecorder.tempPath, `${randomUUID()}.sock`);
            url = `unix:${socketPath}`;
        }
        const server = net.createServer((socket) => stream.rewind(startRecordTime, endTimeMs).pipe(socket));
        server.listen(socketPath);

        return {
            url,
            server
        };
    }
}
