import { Car } from "../models/car.model.js";

async function closeExpiredAuctionSessions() {
  const now = new Date();

  const expiredCars = await Car.find({
    progress: "In auction",
    "bid.auctionSessionEndTime": { $ne: null, $lte: now },
  });

  for (const car of expiredCars) {
    const bidderCount = car.bid?.bidders?.length ?? 0;

    car.progress = bidderCount > 0 ? "Verifying bidders" : "Finished auction";

    if (!car.bid) {
      car.bid = {
        followers: 0,
        currentprice: car.car?.startingprice ?? 0,
        bidders: [],
        auctioncounter: 0,
        auctionSessionEndTime: null,
      } as any;
    }

    const bidData = car.bid as any;
    bidData.auctionSessionEndTime = null;
    await car.save();
  }

  return expiredCars.length;
}

function startAuctionSessionMonitor(intervalMs = 30000) {
  const timer = setInterval(async () => {
    try {
      await closeExpiredAuctionSessions();
    } catch (error) {
      console.error("Error closing expired auction sessions", error);
    }
  }, intervalMs);

  return timer;
}

export { closeExpiredAuctionSessions, startAuctionSessionMonitor };

