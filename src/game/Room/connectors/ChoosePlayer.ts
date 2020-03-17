import { Command } from '@karuta/sanguosha-core';

import ActionConnector from '../ActionConnector';
import Room from '../Room';
import Player from '../../Player';

interface Options {
	feasible: boolean;
	candidates: number[];
}

export default class ChoosePlayer extends ActionConnector<Options> {
	constructor() {
		super(Command.ChoosePlayer);
	}

	proceed(room: Room, options: Options): void {
		const client = room.getClient();
		const locker = client.lock();

		const { feasible } = options;
		const dashboard = room.getDashboard();

		const onSelectedPlayerChanged = (player: Player): void => {
			const selected = player.isSelected();
			client.reply(locker, { player: player.getSeat(), selected });
		};
		room.once('selectedPlayerChanged', onSelectedPlayerChanged);

		if (feasible) {
			dashboard.setConfirmListener(() => {
				room.off('selectedPlayerChanged', onSelectedPlayerChanged);
				room.resetSelection();
				dashboard.resetSelection();
				client.reply(locker, { confirm: true });
			});
		}
		dashboard.setConfirmEnabled(feasible);

		dashboard.setCancelListener(() => {
			room.off('selectedPlayerChanged', onSelectedPlayerChanged);
			room.resetSelection();
			dashboard.resetSelection();
			client.reply(locker, { cancel: true });
		});
		dashboard.setCancelEnabled(true);

		room.once('lockerChanged', () => {
			room.off('selectedPlayerChanged', onSelectedPlayerChanged);
		});

		const { candidates } = options;
		for (const player of room.getPlayers()) {
			const selectable = candidates.includes(player.getSeat());
			if (selectable) {
				player.setSelectable(true);
			} else if (!player.isSelected()) {
				player.setSelectable(false);
			}
		}
		room.setSelectable(true);
	}
}