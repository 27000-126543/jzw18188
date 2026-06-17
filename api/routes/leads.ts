import { Router } from "express";
import { leadsService } from "../services/leads.service";
import type {
  LeadStage,
  LeadSource,
  CommunicationType,
} from "../../shared/types";

export const leadsRouter = Router();

leadsRouter.get("/", (req, res) => {
  const stage = req.query.stage as LeadStage | undefined;
  const ownerId = req.query.ownerId as string | undefined;
  const source = req.query.source as LeadSource | undefined;
  const search = req.query.search as string | undefined;
  res.json(leadsService.list({ stage, ownerId, source, search }));
});

leadsRouter.get("/:id", (req, res) => {
  const lead = leadsService.getById(req.params.id);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
});

leadsRouter.post("/", (req, res) => {
  res.json(leadsService.create(req.body));
});

leadsRouter.put("/:id", (req, res) => {
  const lead = leadsService.update(req.params.id, req.body);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
});

leadsRouter.patch("/:id/stage", (req, res) => {
  const stage = req.body.stage as LeadStage;
  if (!stage) return res.status(400).json({ error: "stage is required" });
  const lead = leadsService.changeStage(req.params.id, stage);
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  res.json(lead);
});

leadsRouter.post("/:id/convert", (req, res) => {
  const dealValue = Number(req.body.dealValue) || 0;
  const customer = leadsService.convert(req.params.id, dealValue);
  if (!customer) return res.status(404).json({ error: "Lead not found" });
  res.json(customer);
});

leadsRouter.get("/:id/communications", (req, res) => {
  res.json(leadsService.listCommunications(req.params.id));
});

leadsRouter.post("/:id/communications", (req, res) => {
  const data = {
    type: req.body.type as CommunicationType,
    content: req.body.content as string,
    createdBy: req.body.createdBy as string,
  };
  if (!data.type || !data.content || !data.createdBy) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const comm = leadsService.addCommunication(req.params.id, data);
  if (!comm) return res.status(404).json({ error: "Lead not found" });
  res.json(comm);
});

leadsRouter.get("/:id/stage-history", (req, res) => {
  res.json(leadsService.listStageHistory(req.params.id));
});
