export interface DashboardSummary {
  total_deliveries: number;
  total_rits: number;
  pending_cost_deliveries: number;
  confirmed_cost_deliveries: number;
  unpaid_deliveries: number;
  paid_deliveries: number;
  total_cost: string | number;
  trend_period: number;
  delivery_trend: DeliveryTrend[];
}

export interface DashboardSummaryResponse {
  data: DashboardSummary;
}

export interface DeliveryTrend {
  date: string;
  total: number;
}