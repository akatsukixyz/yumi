import {
	Client,
	Collection,
	VoiceConnection,
	StreamDispatcher,
	VoiceChannel
} from 'discord.js';
import { Queue } from './Queue';
export class Yumi {
	public queues: Collection<string, Queue>;
	public connections: Collection<string, VoiceConnection>;
	public streams: Collection<string, StreamDispatcher>;
	constructor(private client: Client) {
		this.client = client;
		this.queues = new Collection();
		this.connections = new Collection();
		this.streams = new Collection();
		for (const [id] of this.client.guilds)
			this.queues.set(id, new Queue(id, null));
	}
	public stopAll() {
		for (const [, queue] of this.queues) {
			queue.stop();
		}
	}
	public async init(id: string, channel: VoiceChannel) {
		this.queues.set(id, new Queue(id, channel));
	}
}
