import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [data, setData] = useState(null);

  // ================= FETCH DASHBOARD =================
  const fetchDashboard = async () => {
    const res = await api.get("/dashboard");
    setData(res.data);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ================= ACTIONS =================
  const addPurchase = async () => {
    await executeAction(
      "/purchase",
      {
        base_id: 1,
        asset_id: 1,
        quantity: 10,
      },
      "Purchase recorded"
    );
  };

  const transfer = async () => {
    await executeAction(
      "/transfer",
      {
        from_base: 1,
        to_base: 2,
        asset_id: 1,
        quantity: 5,
      },
      "Transfer recorded"
    );
  };

  const [message, setMessage] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const executeAction = async (endpoint, payload, successText) => {
    try {
      await api.post(endpoint, payload);
      setMessage(successText);
      await fetchDashboard();
    } catch (error) {
      setMessage(
        error?.response?.data?.message || error?.message || "Request failed"
      );
    }
  };

  const assign = async () => {
    await executeAction(
      "/assign",
      {
        base_id: 1,
        asset_id: 1,
        quantity: 3,
        assigned_to: "Soldier A",
      },
      "Assignment recorded"
    );
  };

  const expend = async () => {
    await executeAction(
      "/expend",
      {
        base_id: 1,
        asset_id: 1,
        quantity: 2,
      },
      "Expenditure recorded"
    );
  };

  // ================= METRICS =================
  const totalPurchases =
    data?.purchases?.reduce((sum, p) => sum + p.quantity, 0) || 0;

  const totalTransferIn =
    data?.transfers?.reduce(
      (sum, t) => sum + (t.to_base === 1 ? t.quantity : 0),
      0
    ) || 0;

  const totalTransferOut =
    data?.transfers?.reduce(
      (sum, t) => sum + (t.from_base === 1 ? t.quantity : 0),
      0
    ) || 0;

  const totalAssignments =
    data?.assignments?.reduce((sum, a) => sum + a.quantity, 0) || 0;

  const totalExpended =
    data?.expenditures?.reduce((sum, e) => sum + e.quantity, 0) || 0;

  const netMovement = totalPurchases + totalTransferIn - totalTransferOut;

  const toggleDetails = () => setDetailsOpen((open) => !open);

  return (
    <div style={{ maxWidth: "900px", margin: "auto", padding: "20px", textAlign: "center" }}>
      <h1>Military Asset Management</h1>

      {message && (
        <div
          style={{
            marginBottom: "20px",
            padding: "12px 16px",
            background: "#eef",
            color: "#003",
            borderRadius: "8px",
          }}
        >
          {message}
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={addPurchase} style={btn}>Add Purchase</button>
        <button onClick={transfer} style={btn}>Transfer</button>
        <button onClick={assign} style={btn}>Assign</button>
        <button onClick={expend} style={btn}>Expend</button>
      </div>

      {/* METRICS */}
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
        <div><strong>Purchases:</strong> {totalPurchases}</div>
        <div><strong>Transfer In:</strong> {totalTransferIn}</div>
        <div><strong>Transfer Out:</strong> {totalTransferOut}</div>
        <div><strong>Assigned:</strong> {totalAssignments}</div>
        <div><strong>Expended:</strong> {totalExpended}</div>
        <div
          style={{ cursor: "pointer", textDecoration: "underline", color: "rgb(255, 255, 255)", marginTop: "4px" }}
          onClick={toggleDetails}
        >
          <strong>Net Movement:</strong> {netMovement} {detailsOpen ? "▲" : "▼"}
        </div>
      </div>

      {detailsOpen && (
        <div
          style={{
            maxWidth: "720px",
            margin: "0 auto 30px",
            padding: "16px",
            background: "#f9f9ff",
            border: "1px solid #ccd",
            borderRadius: "10px",
            textAlign: "left",
          }}
        >
          <h3>Net Movement Details</h3>
          <p>Purchases: {totalPurchases}</p>
          <p>Transfer In: {totalTransferIn}</p>
          <p>Transfer Out: {totalTransferOut}</p>
          <p><strong>Net Movement:</strong> {netMovement}</p>
          <p style={{ marginTop: "10px", fontSize: "0.95rem", color: "#ffffff" }}>
            Note: transfer totals are calculated relative to base 1 in the current demo dataset.
          </p>
        </div>
      )}

      {/* PURCHASE TABLE */}
      <h2>📦 Purchases</h2>
      <Table
        headers={["ID", "Base", "Asset", "Qty"]}
        data={data?.purchases}
        renderRow={(p) => [p.id, p.base_id, p.asset_id, p.quantity]}
      />

      {/* TRANSFER TABLE */}
      <h2>🔁 Transfers</h2>
      <Table
        headers={["ID", "From", "To", "Asset", "Qty"]}
        data={data?.transfers}
        renderRow={(t) => [t.id, t.from_base, t.to_base, t.asset_id, t.quantity]}
      />

      {/* ASSIGNMENTS */}
      <h2>🪖 Assignments</h2>
      <Table
        headers={["ID", "Base", "Asset", "Qty", "To"]}
        data={data?.assignments}
        renderRow={(a) => [a.id, a.base_id, a.asset_id, a.quantity, a.assigned_to]}
      />

      {/* EXPENDITURE */}
      <h2>💥 Expenditures</h2>
      <Table
        headers={["ID", "Base", "Asset", "Qty"]}
        data={data?.expenditures}
        renderRow={(e) => [e.id, e.base_id, e.asset_id, e.quantity]}
      />
    </div>
  );
}

// ================= REUSABLE TABLE =================
function Table({ headers, data = [], renderRow }) {
  return (
    <table border="1" cellPadding="10" style={{ margin: "auto", marginBottom: "30px" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, i) => (
          <tr key={i}>
            {renderRow(item).map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ================= BUTTON STYLE =================
const btn = {
  margin: "10px",
  padding: "10px 15px",
  cursor: "pointer",
};

export default App;