import { DashboardUser } from "../modules/dashBoardUser/dashboardUser.model.js";

const verifyRole = async (req, res, next) => {
  const requester = req?.userId;
  const requesterAccount = await DashboardUser.findOne({ _id: requester });
  if (requesterAccount?.role !== "parlour") {
    return res.status(403).send({ message: "Forbidden Access." });
  } else {
    next();
  }
};

export default verifyRole;
