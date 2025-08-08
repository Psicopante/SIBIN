export const dataGridStyles = (colors) => ({
  "& .MuiDataGrid-root": { border: "none" },
  "& .MuiDataGrid-cell": { borderBottom: "none" },
  "& .name-column--cell": { color: colors.greenAccent[300] },
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: colors.gov[500], //tecnico[500]
    borderBottom: "none",
    color: "#ffffff",
  },

  "& .MuiDataGrid-scrollbarFiller": {
    backgroundColor: colors.desert[700],
  },
  "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
  "& .MuiDataGrid-footerContainer": {
    borderTop: "none",
    backgroundColor: colors.gov[500],
    color: "#ffffff",
  },
  "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
    color: `${colors.grey[100]} !important`,
  },
  "& .MuiCheckbox-root": {
    // Cambiado de MuiCheckbox-root
    color: `${colors.greenAccent[400]} !important`,
  },
  "& .MuiDataGrid-row": {
    "&:hover": {
      backgroundColor: colors.primary[300],
    },
    "&.Mui-selected": {
      backgroundColor: colors.primary[300],
      "&:hover": {
        backgroundColor: colors.primary[200],
      },
    },
  },
});
