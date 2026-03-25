import React from 'react';

const CurrencyText = (props) => {
	const value = props.value;
	const colored = props.colored || false;
	const negativeOnly = props.negativeOnly || false;

	function formatCurrency(value) {
		try {
			const n = Number(value || 0);
			return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);
		} catch (_e) {
			return (Number(value || 0)).toFixed(2) + ' €';
		}
	}

	const valueText = formatCurrency(value);
	if(colored) {
		if(negativeOnly) {
			if(value < 0) {
				const valueColor = '#cf1322';
				return <span style={{color: valueColor, textWrap: "nowrap"}}>{valueText}</span>
			}
		}else{
			const valueColor = value > 0 ? '#3f8600' : (value < 0 ? '#cf1322' : undefined);
			return <span style={{ color: valueColor, textWrap: "nowrap" }}>{valueText}</span>;
		}
	}
	return <span style={{textWrap: "nowrap" }}>{valueText}</span>;
};

export default CurrencyText;
