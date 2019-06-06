import { Queue } from './Queue';
import ytdl from 'ytdl-core';
import { StreamDispatcher } from 'discord.js';
import { nnc, nc } from '..';

interface SongOptions {
	name: string;
	url: string;
	id: string;
	queue: Queue;
	state: SongState;
	quality?: string;
	totalTime?: number;
	currentTime?: number;
}

enum SongState {
	INIT = 'INIT',
	PLAYING = 'PLAYING',
	PAUSED = 'PAUSED',
	STOPPED = 'STOPPED',
	SKIPPED = 'SKIPPED'
}

export class Song implements SongOptions {
	public name: string;
	public url: string;
	public id: string;
	public queue: Queue;
	public state: SongState;
	private stream: StreamDispatcher | null;
	public quality?: string;
	public totalTime?: number;
	public currentTime?: number;
	constructor(options: SongOptions) {
		this.state = SongState.INIT;

		const {
			name,
			url,
			id,
			quality,
			totalTime,
			currentTime,
			queue
		} = options;

		this.queue = queue;
		this.name = name;
		this.url = url;
		this.id = id;
		this.stream = null;
		if (quality) this.quality = quality;
		if (totalTime) this.totalTime = totalTime;
		if (currentTime) this.currentTime = currentTime;
	}

	public async play(song: string) {
		if (!this.queue.connection) throw nnc;
		var stream;
		if (this.isUrl(song) && ytdl.validateURL(song))
			stream = this.queue.connection.play(
				await ytdl(song, {
					quality: this.quality || 'highestaudio'
				})
			);
		const id = this.parseID(song);
		if (id && ytdl.validateID(id))
			stream = this.queue.connection.play(
				await ytdl('https://youtu.be/' + id, {
					quality: this.quality || 'highestaudio'
				})
			);
		this.stream!.on('end', () => this.skip());
		this.stream = stream;
		this.queue.stream = this.stream;
		return this.stream;
	}
	private isUrl(str: string): boolean {
		if (
			/(https?:\/\/)?(www.)?(youtu.be|youtube.com)\/watch\?v=.+/.test(str)
		)
			return true;
		if (this.parseID(str)) return false;
		return false;
	}
	private parseID(url: string) {
		if (
			!/(https?:\/\/)?(www.)?(youtu.be|youtube.com)\/watch\?v=.+/.test(
				url
			)
		)
			return null;
		const id = url.split('?v=');
		return id.length > 1 ? id[1] : url.split('.be/')[1] || url;
	}
	public async resume() {
		this.state = SongState.PLAYING;
	}
	public pause() {
		this.stream!.pause();
		this.state = SongState.PAUSED;
	}
	public async stop() {
		this.stream!.pause();
		this.stream = null;
		this.state = SongState.STOPPED;
	}
	public async skip() {
		this.stop();
		this.queue.next();
		this.state = SongState.SKIPPED;
	}
	public async setVolume(vol: number) {
		if (!this.stream) throw nc;
		this.stream.setVolume(vol);
	}
}
