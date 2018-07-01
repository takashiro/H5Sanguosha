
import Enum from '../../net/Enum';

const Type = new Enum(
	'Unknown',

	'Hand',
	'Equip',
	'DelayedTrick',
	'Judge',

	'DrawPile',
	'DiscardPile',
	'Special',
	'Table',
	'Wugu',
);

export default Type;
