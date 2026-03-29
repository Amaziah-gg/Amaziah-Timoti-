import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Neon Ledger Systems Online" });
  });

  // Mock financial data endpoint
  app.get("/api/financials", (req, res) => {
    res.json({
      balance: 2450.00,
      debt: 15000.00,
      monthlyBudget: 1200.00,
      spent: 850.00,
      transactions: [
        { id: 1, merchant: "Amazon.com", amount: -42.50, category: "Wants", date: "2024-03-02" },
        { id: 2, merchant: "Employer Payroll", amount: 2100.00, category: "Income", date: "2024-03-01" },
        { id: 3, merchant: "Starbucks", amount: -6.50, category: "Wants", date: "2024-02-28" },
        { id: 4, merchant: "Rent Payment", amount: -1200.00, category: "Needs", date: "2024-02-27" }
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Neon Ledger] Core initialized at http://localhost:${PORT}`);
  });
}

startServer();
