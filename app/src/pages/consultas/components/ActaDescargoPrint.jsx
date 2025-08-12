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

// encima del componente
const prettifyCaracteristica = (raw) => {
  if (!raw) return "-";
  let t = String(raw).trim();

  // Normalizar espacios
  t = t.replace(/\s+/g, " ");
  t = t.replace(/\s*,\s*/g, ", ").replace(/\s*;\s*/g, "; ");
  t = t.replace(/["”]/g, '"');

  // Formato para medidas tipo 47.5x24x29" -> 47.5 × 24 × 29 in
  t = t.replace(
    /(\d+(?:[.,]\d+)?)\s*[xX]\s*(\d+(?:[.,]\d+)?)\s*[xX]\s*(\d+(?:[.,]\d+)?)(\s*"?)/g,
    (m, a, b, c, quote) => `${a} × ${b} × ${c}${quote ? " in" : ""}`
  );

  // Separar en partes y devolver en líneas
  return t
    .split(/;\s+|, (?=[A-Za-zÁÉÍÓÚÑ0-9])/)
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n");
};

// estilo para permitir saltos de línea/viñetas en la celda
const caracCell = { whiteSpace: "pre-wrap", wordBreak: "break-word" };

export default function ActaDescargoPrint({
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
  const [cargoArea, setCargoArea] = useState("Director");

  const nombreArea = useMemo(() => {
    return (
      acta?.area ||
      acta?.areaEmpleado ||
      acta?.Area ||
      acta?.AreaNombre ||
      acta?.empleadoArea ||
      "______"
    );
  }, [acta]);

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
        {/* {pdfServiceUrl && (
          <button onClick={handleDescargarPDF} style={btn("dark")}>
            <FaFilePdf style={{ marginRight: 6 }} /> Descargar PDF
          </button>
        )} */}
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

        <h1 style={titulo}>ACTA DESCARGO EMPLEADO</h1>
        {acta?.categoria === "Area" && (
          <div
            className="no-print"
            style={{ display: "flex", gap: 8, alignItems: "center", margin: "8px 0 4px" }}
          >
            <label style={{ fontSize: 12 }}>Cargo en el acta:</label>
            <select
              value={cargoArea}
              onChange={(e) => setCargoArea(e.target.value)}
              style={{ padding: "6px 8px", fontSize: 12, borderRadius: 6 }}
            >
              <option value="Director">Director</option>
              <option value="Jefe">Jefe</option>
              <option value="Encargado">Encargado</option>
            </select>
            <span style={{ fontSize: 12, color: "#555" }}>(No se imprimirá este selector)</span>
          </div>
        )}
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
          {acta?.categoria === "Area" ? (
            <>
              Yo, <strong>{acta.empleado}</strong>, mayor de edad, con número de identidad
              <strong> {acta.identidad || "__________"}</strong>, <strong>{cargoArea}</strong> de{" "}
              <strong>{nombreArea}</strong>; empleado(a) de la Comisión Nacional de Telecomunicaciones
              (CONATEL), he RECIBIDO de la Unidad de Bienes Nacionales de la Gerencia Administrativa, los
              bienes abajo descritos, RESPONSABILIZÁNDOME de su cuidado, custodia y conservación; y a
              mostrarlos al ser requeridos por la autoridad competente y a RESTITUIR su VALOR TOTAL en
              caso de pérdida, negligencia o uso inadecuado de los mismos.
            </>
          ) : (
            <>
              Yo, <strong>{acta.empleado}</strong>, mayor de edad, con número de identidad
              <strong> {acta.identidad || "__________"}</strong>, empleado(a) de la Comisión Nacional de
              Telecomunicaciones (CONATEL), en este acto se hace constar que entrego a CONATEL los bienes
              abajo descritos, los cuales estaban bajo mi cargo y custodia; bienes descritos como sigue:
            </>
          )}
        </section>

        {/* Tabla */}
        <table style={tabla}>
          <thead>
            <tr>
              <th style={{ width: "4%" }}>No.</th>
              <th style={{ width: "8%" }}>Registro</th>
              <th style={{ width: "12%" }}>Nombre</th>
              <th style={{ width: "28%" }}>Característica</th>
              <th style={{ width: "9%" }}>Marca</th>
              <th style={{ width: "9%" }}>Modelo</th>
              <th style={{ width: "9%" }}>Color</th>
              <th style={{ width: "10%" }}>Serie</th>
              <th style={{ width: "9%" }}>Estado</th>
              <th style={{ width: "18%" }}>Ubicación</th>
              <th style={{ width: "10%", textAlign: "right" }}>Costo</th>
            </tr>
          </thead>
          <tbody>
            {acta.detalles?.map((d, i) => (
              <tr key={d.Id_Acta_Det}>
                <td>{i + 1}</td>
                <td>{d?.activo?.Act_Registro}</td>
                <td>{(d?.activo?.Act_Descripcion || "").trim()}</td>
                <td style={caracCell}>{prettifyCaracteristica(d?.activo?.Act_Caracteristica)}</td>
                <td style={caracCell}>{prettifyCaracteristica(d?.activo?.Act_Marca)}</td>
                <td>{(d?.activo?.Act_Modelo || "").trim()}</td>
                <td style={caracCell}>{prettifyCaracteristica(d?.activo?.Act_Color)}</td>
                <td style={caracCell}>{prettifyCaracteristica(d?.activo?.Act_Serie)}</td>
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
          <div style={{ fontSize: "12px" }}>{acta.NotaMarginal}</div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "15mm", // distancia desde el borde inferior de la hoja
            left: "14mm", // igual que el margen lateral del documento
            fontSize: "12px",
          }}
        >
          Documento generado por: <strong>{acta.SistemaUsuario}</strong>
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
  position: "relative",
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
  tableLayout: "fixed",
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
