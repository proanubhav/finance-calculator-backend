const { saveOperation } = require('../models/Operation');

exports.calculate = async (req, res) => {
    const { monthlyInvestment, annualStepUP, expectdReturnRate, investmentPeriod } = req.body;

    try {
        // Validate inputs
        if (!monthlyInvestment || !annualStepUP || !expectdReturnRate || !investmentPeriod) {
            return res.status(400).json({ error: 'All inputs are required' });
        }

        const P = parseFloat(monthlyInvestment); // Initial monthly investment
        const stepUpRate = parseFloat(annualStepUP) / 100; // Step-up rate (e.g. 12% means 0.12)
        const r = parseFloat(expectdReturnRate) / 100 / 12; // Monthly return rate
        const n = 12; // Monthly compounding (12 months per year)
        const t = parseInt(investmentPeriod, 10); // Investment period in years

        if (isNaN(P) || isNaN(stepUpRate) || isNaN(r) || isNaN(t)) {
            return res.status(400).json({ error: 'Invalid input values' });
        }

        let maturityAmount = 0;
        let yearBreakdown = [];
        let cumulativeInvestedAmount = 0; // Track cumulative investment

        // Loop through each year to calculate compounded maturity for each contribution
        for (let k = 0; k < t; k++) {
            const yearlyContribution = P * Math.pow(1 + stepUpRate, k); // Monthly contribution after step-up for this year
            let investedAmount = yearlyContribution * 12; // Total yearly investment (monthly * 12 months)
            cumulativeInvestedAmount += investedAmount; // Add to cumulative investment
            let yearlyMaturity = 0;

            // Calculate the maturity for each month's contribution in this year
            for (let month = 0; month < 12; month++) {
                const remainingMonths = (t - k) * 12 - month; // Remaining months from this contribution to the end of the investment
                const compoundedValue = yearlyContribution * Math.pow(1 + r, remainingMonths); // Compounded value for this contribution
                yearlyMaturity += compoundedValue;
            }
            maturityAmount += yearlyMaturity;

            // Add yearly breakdown to track cumulative invested and resultant amount
            yearBreakdown.push({
                year: 2024 + k, // Start year (change to your desired start year)
                investedAmount: `₹${cumulativeInvestedAmount.toFixed(0).toLocaleString()}`,
                resultantAmount: `₹${yearlyMaturity.toFixed(0).toLocaleString()}`
            });
        }

        // Save the operation to the database
        await saveOperation({
            monthlyInvestment: P,
            annualStepUP,
            expectdReturnRate,
            investmentPeriod,
            maturityAmount: maturityAmount.toFixed(0),
        });

        // Send response with breakdown
        res.status(200).json({
            maturityAmount: maturityAmount.toFixed(0),
            yearBreakdown // Return the yearly breakdown as well
        });
    } catch (error) {
        console.error('Error in SIP step-up calculation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};