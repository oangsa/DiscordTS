import type { VoiceConnection } from "@discordjs/voice";
import type { AudioReceiveStream } from '@discordjs/voice';
import { Server } from 'net';
import { ReplayReadable } from '../classes/ReplayReadable';
import { Readable, Writable, type WritableOptions } from 'stream';

export default interface IVoiceRecorder {
    // Functional methods
    startRecording(connection: VoiceConnection): void;
    stopRecording(connection: VoiceConnection): void;

    // Utility methods
    isRecording(guildId?: string): boolean;

    // Getters
    getRecordedVoice<T extends Writable>(writeStream: T, guildId: string, exportType: AudioExportType, minutes: number, userVolumes: UserVolumesDict): Promise<boolean>;
    getRecordedVoiceAsBuffer(guildId: string, exportType: AudioExportType, minutes: number, userVolumes: UserVolumesDict): Promise<Buffer>;
    getRecordedVoiceAsReadable(guildId: string, exportType: AudioExportType, minutes: number, userVolumes: UserVolumesDict): Readable;
}


export type ReadWriteOptions = { length?: number } & WritableOptions;
export type AudioExportType = 'single' | 'separate';
export type UserVolumesDict = Record<string, number | undefined>;
export type RecordOptions = {
    // Maximum size in MB a user stream can have. Default 100.
    maxUserRecordingLength: number;

    // Keep last x minutes for recording. Older voice chunks will be deleted. Default 10.
    maxRecordTimeMinutes: number;

    // Target sample rate of the recorded stream. Default 16,000.
    sampleRate: number;

    // Target channel count of the recorded stream. Default 2.
    channelCount: number;
}

export interface ChunkArrayItem {
    chunk: Buffer;
    encoding: BufferEncoding
}

export interface BufferArrayElement {
    chunk: Buffer;
    encoding: BufferEncoding;
    startTime: number;
    stopTime: number
}

export interface EncodingOptions {
    chunkSize: number;
    sampleRate: number;
    numChannels: number;
    bytesPerElement: number;
}

export interface SocketServerConfig {
    url: string;
    server: Server;
}

export interface UserStreams {
    [userId: string]: {
        source: AudioReceiveStream,
        out: ReplayReadable,
    } | undefined;
}

export interface DiscordClientInterface {
    users: {
        fetch: (userId: string) => Promise<{username: string}>
    }
}
