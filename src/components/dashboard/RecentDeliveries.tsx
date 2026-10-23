import { useEffect, useState } from "react";
import api from "../../services/api";
import type {
  Delivery,
  DeliveryResponse,
} from "../../types/delivery";

function RecentDeliveries() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoading(true);
        setError(null);

       const response = await api.get<DeliveryResponse>(
        "/deliveries?per_page=5"
      );

        setDeliveries(response.data.data);
      } catch (err) {
        console.error(err);

        setError(
          "Gagal mengambil data pengiriman."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatRupiah = (
    value: string | number | null
  ) => {
    if (value === null) {
      return "Belum Ditentukan";
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Pengiriman Terbaru
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Aktivitas pengiriman terbaru dari sistem.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Loading */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            Memuat data pengiriman...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          deliveries.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Belum ada data pengiriman.
            </div>
          )}

        {/* Data */}
        {!loading &&
          !error &&
          deliveries.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Tanggal
                    </th>

                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Sopir
                    </th>

                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Kendaraan
                    </th>

                    <th className="px-6 py-4 text-left font-medium text-slate-500">
                      Keterangan
                    </th>

                    <th className="px-6 py-4 text-center font-medium text-slate-500">
                      Rit
                    </th>

                    <th className="px-6 py-4 text-right font-medium text-slate-500">
                      Total
                    </th>

                    <th className="px-6 py-4 text-center font-medium text-slate-500">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {deliveries.map((delivery) => (
                    <tr
                      key={delivery.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      {/* Tanggal */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatDate(
                          delivery.delivery_date
                        )}
                      </td>

                      {/* Sopir */}
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {delivery.driver.name}
                      </td>

                      {/* Kendaraan */}
                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {delivery.vehicle.plate_number}
                      </td>

                      {/* Keterangan */}
                      <td className="max-w-xs px-6 py-4 text-slate-600">
                        <span className="line-clamp-2">
                          {delivery.description}
                        </span>
                      </td>

                      {/* Rit */}
                      <td className="px-6 py-4 text-center font-medium text-slate-700">
                        {delivery.quantity}
                      </td>

                      {/* Total */}
                      <td className="whitespace-nowrap px-6 py-4 text-right font-medium text-slate-900">
                        {formatRupiah(
                          delivery.total_cost
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={
                            delivery.payment_status ===
                            "paid"
                              ? "inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600"
                              : "inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-600"
                          }
                        >
                          {delivery.payment_status ===
                          "paid"
                            ? "Sudah Dibayar"
                            : "Belum Dibayar"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
    </section>
  );
}

export default RecentDeliveries;