import api from "../services/api";

export type CostStatus = "pending" | "confirmed";

export type PaymentStatus = "paid" | "unpaid";

export interface Driver {
  id: number;
  name: string;
  vehicle_id: number | null;
  phone: string | null;
  status: boolean;
  vehicle?: Vehicle | null;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_code: string;
  description: string | null;
  status: boolean;
  driver?: Driver | null;
}

export interface Delivery {
  id: number;
  delivery_date: string;
  driver_id: number;
  vehicle_id: number;
  description: string;
  quantity: number;
  unit_cost: string | null;
  total_cost: string | null;
  cost_status: CostStatus;
  payment_status: PaymentStatus;
  driver: Driver;
  vehicle: Vehicle;
}

export interface DeliveryResponse {
  data: Delivery[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface DeliveryDetailResponse {
  data: Delivery;
}

export const deleteDelivery = async (id: number) => {
  const response = await api.delete(`/deliveries/${id}`);

  return response.data;
};

export interface DeliverySummary {
  total_cost: number;
  paid_cost: number;
  unpaid_cost: number;
  pending_count: number;
}

export interface DeliveryResponse {
  data: Delivery[];

  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };

  summary: DeliverySummary;
}