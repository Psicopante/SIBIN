// src/pages/ActaCargoPrint.jsx
import React, { useEffect, useMemo, useState } from "react";
import { FaPrint, FaArrowLeft, FaFilePdf } from "react-icons/fa";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

// Helpers
const formatFechaUTC = (isoUtc) => dayjs.utc(isoUtc).format("DD/MM/YYYY");
const formatHNL = (n) =>
  new Intl.NumberFormat("es-HN", { style: "currency", currency: "HNL" }).format(Number(n || 0));

export default function ActaCargoPrint({
  data, // opcional: el JSON que ya tienes
  numeroActa, // opcional: si quieres que el compo haga fetch
  fetchActaFn, // opcional: async (numeroActa)=> data
  logoGobUrl, // opcional: url/logo gov
  logoConatelUrl, // opcional: url/logo conatel
  onBack, // opcional: callback al volver
  pdfServiceUrl, // opcional: ej. "http://localhost:3000/pdf"
}) {
  const [acta, setActa] = useState(data);
  const [loading, setLoading] = useState(!data);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!data && fetchActaFn && numeroActa) {
        try {
          setLoading(true);
          const res = await fetchActaFn(numeroActa);
          setActa(res);
        } catch (e) {
          setErr("No se pudo cargar el acta.");
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [data, numeroActa, fetchActaFn]);

  const total = useMemo(() => {
    if (!acta?.detalles) return 0;
    return acta.detalles.reduce((acc, d) => acc + Number(d?.activo?.Act_Costo || 0), 0);
  }, [acta]);

  const handleImprimir = () => window.print();

  const handleDescargarPDF = async () => {
    if (!pdfServiceUrl) return alert("Configura pdfServiceUrl primero.");
    try {
      const html = document.getElementById("acta-root")?.outerHTML;
      const resp = await fetch(pdfServiceUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!resp.ok) throw new Error("No se pudo generar el PDF.");
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Acta_${acta?.numeroActa || "documento"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e.message || "Error generando PDF.");
    }
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (err) return <div style={{ color: "crimson", padding: 24 }}>{err}</div>;
  if (!acta) return null;

  return (
    <div style={{ padding: 16 }}>
      {/* Controles (ocultos en impresión) */}
      <div className="no-print" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {onBack && (
          <button onClick={onBack} style={btn("light")}>
            <FaArrowLeft style={{ marginRight: 6 }} /> Volver
          </button>
        )}
        <button onClick={handleImprimir} style={btn()}>
          <FaPrint style={{ marginRight: 6 }} /> Imprimir
        </button>
        {pdfServiceUrl && (
          <button onClick={handleDescargarPDF} style={btn("dark")}>
            <FaFilePdf style={{ marginRight: 6 }} /> Descargar PDF
          </button>
        )}
      </div>

      {/* Documento */}
      <div id="acta-root" style={sheet}>
        <style>{cssPrint}</style>

        {/* Encabezado */}
        <header style={header}>
          <div style={headerCol}>
            {logoGobUrl && <img src={logoGobUrl} alt="Gobierno" style={logo} />}
          </div>
          <div style={headerCenter}>
            <div style={entidadTitulo}>Comisión Nacional de Telecomunicaciones</div>
            <div style={entidadSub}>
              Edificio CONATEL, 6a. Ave. S.O., Colonia Modelo, Comayagüela, M.D.C.
              <br />
              Honduras, Centro América &nbsp;|&nbsp; Apartado Postal 15012
              <br />
              Tel.: (504) 2232-9600
            </div>
          </div>
          <div style={headerCol}>
            {/* {logoConatelUrl && <img src={logoConatelUrl} alt="CONATEL" style={logo} />} */}
          </div>
        </header>

        <h1 style={titulo}>ACTA DE CARGO EMPLEADO</h1>
        <div style={metaRow}>
          <div>
            Acta No. <strong>{acta.numeroActa}</strong>
          </div>
          <div>
            Fecha: <strong>{formatFechaUTC(acta.fecha)}</strong>
          </div>
        </div>
        <div style={{ fontSize: "12px", marginBottom: "10px" }}>
          Generado por: <strong>{acta.SistemaUsuario}</strong>
        </div>

        <section style={parrafo}>
          Yo, <strong>{acta.empleado}</strong>, mayor de edad, con número de identidad
          <strong> {acta.identidad || "__________"}</strong>; empleado(a) de la Comisión Nacional de
          Telecomunicaciones (CONATEL), he RECIBIDO de la Unidad de Bienes Nacionales de la Dirección de
          Finanzas y Administración, los bienes abajo descritos, RESPONSABILIZÁNDOME de su cuidado,
          custodia y conservación; y a mostrarlos al ser requeridos por la autoridad competente y a
          RESTITUIR su VALOR TOTAL en caso de pérdida, negligencia o uso inadecuado de los mismos.
        </section>

        {/* Tabla */}
        <table style={tabla}>
          <thead>
            <tr>
              <th>No.</th>
              <th>Registro</th>
              <th>Nombre</th>
              <th>Característica</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Color</th>
              <th>Serie</th>
              <th>Estado</th>
              <th>Ubicación</th>
              <th style={{ textAlign: "right" }}>Costo</th>
            </tr>
          </thead>
          <tbody>
            {acta.detalles?.map((d, i) => (
              <tr key={d.Id_Acta_Det}>
                <td>{i + 1}</td>
                <td>{d?.activo?.Act_Registro}</td>
                <td>{(d?.activo?.Act_Descripcion || "").trim()}</td>
                <td>{(d?.activo?.Act_Caracteristica || "").trim()}</td>
                <td>{(d?.activo?.Act_Marca || "").trim()}</td>
                <td>{(d?.activo?.Act_Modelo || "").trim()}</td>
                <td>{(d?.activo?.Act_Color || "").trim()}</td>
                <td>{(d?.activo?.Act_Serie || "").trim()}</td>
                <td>{(d?.activo?.EstadoDescripcion || "").trim()}</td>
                <td>{(d?.activo?.Act_Ubicacion || "").trim()}</td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatHNL(d?.activo?.Act_Costo)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ ...totalRow, justifyContent: "flex-end" }}>
          <div style={{ textAlign: "right" }}>
            <strong>TOTAL EN ACTIVOS: {formatHNL(total)}</strong>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 6, fontSize: "11px" }}>
          *********************** ÚLTIMA LÍNEA ***********************
        </div>
        {/* Firmas */}
        <section style={firmas}>
          <div style={firmaCol}>
            <div style={firmaLinea} />
            <div>Empleado</div>
          </div>
          <div style={firmaCol}>
            <div style={firmaLinea} />
            <div>Jefe de Bienes Nacionales</div>
          </div>
        </section>

        {/* NOTA SIEMPRE */}
        <div style={{ textAlign: "center", marginTop: 30 }}>
          <div style={{ marginBottom: 8, fontWeight: "bold" }}>NOTA</div>
          <div style={{ fontSize: "12px" }}>
            Documento generado por: <strong>{acta.SistemaUsuario}</strong>
          </div>
        </div>

        {/* Nota e impresión (solo en pantalla) */}
        <div className="no-print" style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={handleImprimir} style={btn()}>
            <FaPrint style={{ marginRight: 6 }} /> IMPRIMIR
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== Estilos ===== */
const sheet = {
  width: "816px", // carta 8.5in * 96px
  minHeight: "1056px", // 11in * 96px
  margin: "0 auto",
  padding: "16mm 14mm",
  background: "#fff",
  color: "#111",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,"Helvetica Neue",Arial,sans-serif',
  fontSize: "12px",
  lineHeight: 1.35,
  boxShadow: "0 0 8px rgba(0,0,0,.08)",
};

const header = {
  display: "grid",
  gridTemplateColumns: "120px 1fr 120px",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
};

const headerCol = { display: "flex", justifyContent: "center" };
const headerCenter = { textAlign: "center" };
const logo = { maxHeight: 72, objectFit: "contain" };

const entidadTitulo = {
  fontSize: "18px",
  fontWeight: 700,
  letterSpacing: ".2px",
};

const entidadSub = { fontSize: "11px", color: "#555", marginTop: 4 };

const titulo = {
  textAlign: "center",
  margin: "6px 0 10px",
  fontSize: "16px",
  fontWeight: 700,
};

const metaRow = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 10,
};

const parrafo = {
  textAlign: "justify",
  marginBottom: 12,
};

const tabla = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "11px",
};

const totalRow = {
  display: "flex",
  justifyContent: "flex-end",
  marginTop: 6,
  fontSize: "12px",
};

const firmas = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 40,
  marginTop: 150,
  alignItems: "end",
  textAlign: "center",
};

const firmaCol = {};
const firmaLinea = {
  width: "80%",
  height: 1,
  background: "#333",
  margin: "28px auto 6px",
};

const cssPrint = `
  @page {
    size: Letter;
    margin: 15mm 14mm;
  }
  table thead th {
    border-bottom: 1px solid #222;
    padding: 6px 4px;
    text-align: left;
    font-weight: 700;
  }
  table tbody td {
    border-bottom: 1px solid #e6e6e6;
    padding: 6px 4px;
    vertical-align: top;
  }
  tr, td, th { page-break-inside: avoid; }
  .no-print { display: block; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    #acta-root { box-shadow: none !important; margin: 0 !important; }
  }
`;

/* Botones simples (pantalla) */
function btn(variant = "primary") {
  const base = {
    display: "inline-flex",
    alignItems: "center",
    border: 0,
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 14,
    cursor: "pointer",
  };
  switch (variant) {
    case "light":
      return { ...base, background: "#e9ecef", color: "#111" };
    case "dark":
      return { ...base, background: "#333", color: "#fff" };
    default:
      return { ...base, background: "#1976d2", color: "#fff" };
  }
}
