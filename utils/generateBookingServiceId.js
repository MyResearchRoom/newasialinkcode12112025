const { BookedService } = require("../models")

async function generateBookingSeviceId() {
    const lastBooking = await BookedService.findOne({
        order: [['id', 'DESC']]
    });

    let nextNumber = 1;

    if (lastBooking && lastBooking.id) {
        nextNumber = lastBooking.id + 1;
    }

    return `BS${String(nextNumber).padStart(4, "0")}`;
}

module.exports = generateBookingSeviceId;