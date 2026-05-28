export type ProductInsight = {
  id: string;
  type: "trend" | "anomaly" | "growth";
  title: string;
  body: string;
  severity: "info" | "warning" | "positive";
};
