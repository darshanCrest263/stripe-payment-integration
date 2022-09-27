import { Box } from "@mui/system";
import React from "react";

const cardStyle = {
  boxShadow: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
  width: "35%",
  padding: "16px",
  borderRadius: "8px",
};

const CardWrapper = ({ children }) => {
  return <Box sx={cardStyle}>{children}</Box>;
};

export default CardWrapper;
