import { Router } from "express";
import { customersService } from "../services/customers.service";

export const customersRouter = Router();

customersRouter.get("/", (req, res) => {
  const search = req.query.search as string | undefined;
  res.json(customersService.list({ search }));
});

customersRouter.get("/:id", (req, res) => {
  const customer = customersService.getById(req.params.id);
  if (!customer) return res.status(404).json({ error: "Customer not found" });
  res.json(customer);
});
