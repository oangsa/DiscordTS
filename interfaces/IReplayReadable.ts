import { Readable } from 'stream';
import type { ChunkArrayItem } from './IVoiceRecorder';

export default interface IReplayReadable {
    get startTimeMs(): number;

    _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error | null) => void): void;
    _writev(chunks: Array<ChunkArrayItem>, callback: (error?: Error | null) => void): void;
    _destroy(error: Error | null, callback: (error?: (Error | null)) => void): void;

    rewind(startTime: number, stopTime: number): Readable;
}
