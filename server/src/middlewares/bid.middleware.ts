import type { NextFunction, Request, Response } from "express";
import { redactUserForViewer, resolveViewerContext } from "../utils/user-privacy.js";

async function processBiddersForResponse(req: Request, res: Response, next: NextFunction) {
	try {
		const viewer = await resolveViewerContext(req);
		const bidders = Array.isArray(res.locals.bidders) ? res.locals.bidders : [];

		const processedBidders = bidders.map((bidderItem: any) => {
			const populatedUser = bidderItem?.userid;

			if (!populatedUser || typeof populatedUser !== "object") {
				return bidderItem;
			}

			return {
				...bidderItem,
				userid: {
					...redactUserForViewer(populatedUser, viewer),
				},
			};
		});

		return res.status(200).json({ bidders: processedBidders });
	} catch (error: Error | any) {
		return res.status(500).json({
			message: "Lỗi khi xử lý danh sách bidder",
			error: error?.message,
		});
	}
}

export {
	processBiddersForResponse,
};

