import i18n from '../utils/i18n.js';

// Enum-like helper for Cotisation types
const CotisationType = {
	MEMBERSHIP: 1,
	COURSE: 2,
	DONATION: 3,
	CREDIT: 4,

	// Return translated label for a given type
	getLabel(type) {
		switch (Number(type)) {
			case 1:
				return i18n.t('models.cotisation.type_membership');
			case 2:
				return i18n.t('models.cotisation.type_course');
			case 3:
				return i18n.t('models.cotisation.type_donation');
			case 4:
				return i18n.t('models.cotisation.type_credit');
			default:
				return '';
		}
	},

	// Return all types as an array of { value, label }
	getAll() {
		return [
			{ value: this.MEMBERSHIP, label: this.getLabel(this.MEMBERSHIP) },
			{ value: this.COURSE, label: this.getLabel(this.COURSE) },
			{ value: this.DONATION, label: this.getLabel(this.DONATION) },
			{ value: this.CREDIT, label: this.getLabel(this.CREDIT) },
		];
	},
};

export default CotisationType;
