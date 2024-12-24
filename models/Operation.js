const mongoose = require('mongoose');

const operationSchema = new mongoose.Schema({
    monthlyInvestment: Number,
    annualStepUP: Number,
    expectdReturnRate: Number,
    investmentPeriod: Number,
    // operator: String,
    result: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
});

const Operation = mongoose.model('Operation', operationSchema);

exports.saveOperation = async (operation) => {
    const newOperation = new Operation(operation);
    await newOperation.save();
    console.log('Operation saved to database:', operation);
};

exports.getOperations = async () => {
    return await Operation.find({});
};
