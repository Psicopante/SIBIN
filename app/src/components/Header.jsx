import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme/theme";

const Header = ({ title, subtitle, extraComponent = null }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box mb="30px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
            {title}
          </Typography>
          <Typography variant="h5" color={colors.gov[500]}>
            {subtitle}
          </Typography>
        </Box>

        {extraComponent && (
          <Box ml={2} display="flex" alignItems="center">
            {extraComponent}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Header;
