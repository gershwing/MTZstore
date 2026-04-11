// admin/src/Pages/Support/TicketsList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listTickets } from "../../services/support";
import TicketTable from "../../Components/Support/TicketTable";
import PromoFilters from "../../Components/Promotions/PromoFilters"; // reutilizamos UI de filtros (q/status)

export default function TicketsList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ q: "", status: "" });

  async function fetch() {
    const res = await listTickets(filters);
    const data = res?.data || res;
    setItems(data?.rows || data?.items || []);
  }

  useEffect(() => { fetch(); }, []);

  return (
    <div className="p-4">
      <PromoFilters values={filters} onChange={setFilters} onSubmit={fetch} />
      <TicketTable items={items} onRowClick={(t) => navigate(`/support/${t._id}`)} />
    </div>
  );
}