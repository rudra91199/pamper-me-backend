import Employees from "../models/employee.model.js";

export const getAllEmployees = async (req, res) => {
  try {
    const result = await Employees.find();
    res.send(result);
  } catch (error) {
    console.log(error)
  }
};
