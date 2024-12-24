const validateInputs = (req, res, next) => {
    const { monthlyInvestment, annualStepUP, expectdReturnRate, investmentPeriod } = req.body;

    if (
        monthlyInvestment === undefined ||
        annualStepUP === undefined ||
        expectdReturnRate === undefined ||
        investmentPeriod === undefined
    ) {
        return res.status(400).json({ error: 'All inputs are required' });
    }

    if (
        typeof monthlyInvestment !== 'number' ||
        typeof annualStepUP !== 'number' ||
        typeof expectdReturnRate !== 'number' ||
        typeof investmentPeriod !== 'number'
    ) {
        return res.status(400).json({ error: 'All inputs must be valid numbers' });
    }

    if (monthlyInvestment <= 0) {
        return res.status(400).json({ error: 'Monthly investment must be greater than 0' });
    }
    if (annualStepUP < 0) {
        return res.status(400).json({ error: 'Annual step-up cannot be negative' });
    }
    if (expectdReturnRate <= 0 || expectdReturnRate > 100) {
        return res.status(400).json({ error: 'Expected return rate must be between 0 and 100' });
    }
    if (investmentPeriod <= 0) {
        return res.status(400).json({ error: 'Investment period must be greater than 0' });
    }

    next();
};

module.exports = validateInputs;
