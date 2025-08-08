import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const FlexBetween = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));

export default FlexBetween;
