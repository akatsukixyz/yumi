import { Song } from './Song';
import { VoiceChannel, VoiceConnection, StreamDispatcher } from 'discord.js';
import { nc, qc, nnc } from '..';

export class Queue {
	public songs: Song[];
	public connection: VoiceConnection | null;
	public stream: StreamDispatcher | null;
	private current: Song | null;
	public constructor(id: string, public channel: VoiceChannel | null) {
		this.songs = [];
		this.current = null;
		this.stream = null;
		this.connection = null;
		if (channel) this.channel = channel;
	}
	public async join() {
		if (!this.channel) throw nnc;
		try {
			this.connection = await this.channel.join();
		} catch (e) {
			throw e;
		}
		return this;
	}
	public leave() {
		if (!this.channel) throw nnc;
		try {
			this.channel.leave();
			return true;
		} catch (e) {
			throw e;
		}
	}

	public next() {
		if (!this.current) throw nc;
		if (!this.size) throw qc;
		this.current.skip();
		if (this.hasNext(this.songs)) this.current = this.songs.shift()!;
	}

	public clear() {
		this.songs = [];
	}

	public resume() {
		if (!this.current) throw nc;
		this.current.resume();
	}

	public stop() {
		if (!this.current) throw nc;
		this.current.stop();
	}

	public pause() {
		if (!this.current) throw nc;
		this.current.pause();
		return '';
	}
	public get size() {
		return this.songs.length;
	}
	public nowPlaying() {
		const { name, url, state, currentTime, totalTime } = this.current!;
		return { name, url, state, currentTime, totalTime };
	}
	public end() {
		this.stop();
		this.clear();
	}
	public hasNext(ar: any[]) {
		ar.shift();
		if (ar[0]) return true;
		return false;
	}
}
