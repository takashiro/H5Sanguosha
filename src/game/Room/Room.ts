import { EventEmitter } from 'events';

import { Client } from '@karuta/client';
import { Command as cmd, CardAreaType } from '@karuta/sanguosha-core';

import CardArea from '../CardArea';
import CardPile from '../CardPile';
import Player from '../Player';

import Dashboard from './Dashboard';
import AreaLocator from './AreaLocator';

import createConnectors from './connectors';

class Room extends EventEmitter {
	protected id: number;

	protected client: Client;

	protected dashboard: Dashboard;

	protected selectable: boolean;

	protected players: Player[];

	protected drawPile: CardPile;

	protected discardPile: CardPile;

	constructor(id: number, uid: number, client: Client) {
		super();

		this.id = id;
		this.client = client;
		this.dashboard = new Dashboard(uid);
		this.selectable = false;
		this.players = [];
		this.drawPile = new CardPile(CardAreaType.DrawPile);
		this.discardPile = new CardPile(CardAreaType.DiscardPile);

		this.client.on('lockerChanged', () => this.emit('lockerChanged'));

		const connectors = createConnectors();
		for (const connector of connectors) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			this.client.bind(connector.getCommand(), (params: any): void => {
				connector.proceed(this, params);
			});
		}
	}

	start(): void {
		this.client.send(cmd.StartGame);
	}

	getClient(): Client {
		return this.client;
	}

	getDashboard(): Dashboard {
		return this.dashboard;
	}

	getDashboardUid(): number {
		return this.dashboard.getUid();
	}

	getDashboardPlayer(): Player | undefined {
		return this.dashboard.getPlayer();
	}

	getDrawPile(): CardPile {
		return this.drawPile;
	}

	getDiscardPile(): CardPile {
		return this.discardPile;
	}

	isSelectable(): boolean {
		return this.selectable;
	}

	setSelectable(selectable: boolean): void {
		this.selectable = selectable;
		this.emit('selectableChanged', selectable);
	}

	resetSelection(): void {
		this.setSelectable(false);
		for (const player of this.players) {
			player.setSelectable(false);
			player.setSelected(false);
		}
	}

	getPlayers(): Player[] {
		return this.players;
	}

	setPlayers(players: Player[]): void {
		this.players = players;
		this.emit('playersChanged', players);

		const selectedChanged: (() => void)[] = [];

		const phaseListener = (): void => {
			this.resetSelection();
			this.dashboard.resetSelection();
		};

		for (const player of players) {
			const selectedListener = (): void => {
				this.emit('selectedPlayerChanged', player);
			};
			selectedChanged.push(selectedListener);
			player.on('selectedChanged', selectedListener);

			player.on('phaseChanged', phaseListener);
		}

		this.once('playersChanged', () => {
			for (let i = 0; i < players.length; i++) {
				players[i].off('selectedChanged', selectedChanged[i]);
				players[i].off('phaseChanged', phaseListener);
			}
		});
	}

	getOtherPlayers(): Player[] {
		return this.players.slice(1);
	}

	findPlayer(seat: number): Player | undefined {
		return this.players.find((player) => player.getSeat() === seat);
	}

	findArea(locator: AreaLocator): CardArea | null {
		if (locator.owner) {
			const player = this.findPlayer(locator.owner);
			if (!player) {
				return null;
			}

			switch (locator.type) {
			case CardAreaType.Hand:
				return player.getHandArea();
			case CardAreaType.Equip:
				return player.getEquipArea();
			case CardAreaType.Judge:
				return player.getJudgeArea();
			case CardAreaType.Process:
				return this.discardPile;
			default:
				return null;
			}
		}

		switch (locator.type) {
		case CardAreaType.DrawPile:
			return this.drawPile;
		case CardAreaType.DiscardPile:
			return this.discardPile;
		default:
			return null;
		}
	}
}

export default Room;