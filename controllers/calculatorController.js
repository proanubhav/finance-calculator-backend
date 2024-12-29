const { saveOperation } = require('../models/Operation');

// Function to calculate yearly data for step-up investments
const calculateYearlyData = (monthlyInvestment, annualStepUP, expectdReturnRate, year, previousMaturity, cumulativeInvestedAmount) => {
    const stepUpRate = parseFloat(annualStepUP) / 100; // Step-up rate
    const r = parseFloat(expectdReturnRate) / 100 / 12; // Monthly return rate

    // Calculate monthly contribution for this year
    const yearlyContribution = monthlyInvestment * Math.pow(1 + stepUpRate, year - 1);
    const yearlyInvestedAmount = yearlyContribution * 12; // Total invested amount for this year

    // Calculate the maturity for the current year's contribution (compounding monthly)
    let yearlyMaturity = 0;
    for (let month = 0; month < 12; month++) {
        const monthsRemaining = 12 - month; // Remaining months in this year
        yearlyMaturity += yearlyContribution * Math.pow(1 + r, monthsRemaining);
    }

    // Add the maturity from previous year's total maturity (for 12 months)
    let totalMaturity = 0;
    if (previousMaturity > 0) {
        totalMaturity += previousMaturity * Math.pow(1 + r, 12); // Compound previous year's maturity for 12 months
    }

    // Return the yearly breakdown with compounded maturity and cumulative invested amount
    return {
        year: 2024 + year - 1, // Adjust starting year if needed
        investedAmount: `₹${(yearlyInvestedAmount + cumulativeInvestedAmount).toFixed(0).toLocaleString()}`, // Total invested amount for all years
        maturityAmount: `₹${(yearlyMaturity + totalMaturity).toFixed(0).toLocaleString()}` // Maturity of the total invested amount
    };
};

// Main function to calculate overall data
exports.calculate = async (req, res) => {
    const { monthlyInvestment, annualStepUP, expectdReturnRate, investmentPeriod } = req.body;

    try {
        // Validate inputs
        if (!monthlyInvestment || !annualStepUP || !expectdReturnRate || !investmentPeriod) {
            return res.status(400).json({ error: 'All inputs are required' });
        }

        const P = parseFloat(monthlyInvestment); // Initial monthly investment
        const t = parseInt(investmentPeriod, 10); // Investment period in years

        if (isNaN(P) || isNaN(annualStepUP) || isNaN(expectdReturnRate) || isNaN(t)) {
            return res.status(400).json({ error: 'Invalid input values' });
        }

        let totalMaturityAmount = 0; // Total maturity amount
        let yearBreakdown = []; // Store yearly results
        let previousMaturity = 0; // Store previous year's maturity value
        let cumulativeInvestedAmount = 0; // To track the cumulative invested amount

        // Loop through the investment period
        for (let year = 1; year <= t; year++) {
            const yearlyData = calculateYearlyData(P, annualStepUP, expectdReturnRate, year, previousMaturity, cumulativeInvestedAmount);

            // Accumulate the total maturity amount
            totalMaturityAmount = parseFloat(yearlyData.maturityAmount.replace(/₹|,/g, ''));

            // Update the previous year's maturity for next iteration
            previousMaturity = parseFloat(yearlyData.maturityAmount.replace(/₹|,/g, ''));

            // Update cumulative investment amount for next year
            cumulativeInvestedAmount = parseFloat(yearlyData.investedAmount.replace(/₹|,/g, ''));

            // Push the yearly data
            yearBreakdown.push(yearlyData);
        }

        // Save the operation to the database
        await saveOperation({
            monthlyInvestment: P,
            annualStepUP,
            expectdReturnRate,
            investmentPeriod,
            maturityAmount: totalMaturityAmount.toFixed(0),
        });

        // Send response
        res.status(200).json({
            maturityAmount: totalMaturityAmount.toFixed(0), // Total maturity
            yearBreakdown // Yearly breakdown
        });
    } catch (error) {
        console.error('Error in SIP step-up calculation:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
