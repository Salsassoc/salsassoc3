import React from 'react';

const CurrencyText = (props) => {
	const value = props.value;
	const colored = props.colored || false;

	function formatCurrency(value) {
		try {
			const n = Number(value || 0);
			return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
		} catch (_e) {
			return (Number(value || 0)).toFixed(2) + ' €';
		}
	}

	const valueText = formatCurrency(value);
	if(colored){
		const valueColor = value > 0 ? '#3f8600' : (value < 0 ? '#cf1322' : undefined);
		return <span style={{ color: valueColor }}>{valueText}</span>
	}
	return valueText;
};

export default CurrencyText;
