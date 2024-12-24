const { saveOperation } = require('../models/Operation');

exports.calculate = async (req, res) => {
    const { monthlyInvestment, annualStepUP, expectdReturnRate, investmentPeriod } = req.body;

    try {
        // Validate inputs
        if (!monthlyInvestment || !annualStepUP || !expectdReturnRate || !investmentPeriod) {
            return res.status(400).json({ error: 'All inputs are required' });
        }

        const P = parseFloat(monthlyInvestment);
        const stepUpRate = parseFloat(annualStepUP) / 100;
        const r = parseFloat(expectdReturnRate) / 100;
        const n = 12;
        const t = parseInt(investmentPeriod, 10);

        if (isNaN(P) || isNaN(stepUpRate) || isNaN(r) || isNaN(t)) {
            return res.status(400).json({ error: 'Invalid input values' });
        }

        let maturityAmount = 0;

        for (let k = 0; k < t; k++) {
            const yearlyContribution = P * Math.pow(1 + stepUpRate, k);
            const remainingMonths = (t - k) * 12;
            for (let month = 0; month < 12; month++) {
                const compoundedValue = yearlyContribution * Math.pow(1 + r / n, remainingMonths - month);
                maturityAmount += compoundedValue;
            }
        }

        await saveOperation({
            monthlyInvestment: P,
            annualStepUP,
            expectdReturnRate,
            investmentPeriod,
            maturityAmount: maturityAmount.toFixed(0),
        });

        res.status(200).json({ maturityAmount: maturityAmount.toFixed(0) });
    } catch (error) {
        console.error('Error in SIP step-up calculation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
