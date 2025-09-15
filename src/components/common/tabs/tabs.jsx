import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

export const Tabs = ({ selectedTab, handleChange, tabsData }) => {
  const theme = useTheme();

  // Underline-style tabs with animated underline
  const getTabStyle = (index) => ({
    color: selectedTab === index ? theme.palette.text.primary : "#9E9E9E",
    fontWeight: selectedTab === index ? "600" : "normal",
    textTransform: "none",
    paddingBottom: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    position: "relative",
  });

  const underlineStyle = (index) => ({
    content: '""',
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "2px",
    width: selectedTab === index ? "100%" : "0%",
    backgroundColor: theme.palette.secondary.main,
    transition: "width 0.3s ease", // underline animation
  });

  return (
    <Components.Box
      sx={{
        width: "100%",
        display: "flex",
        gap: "40px",
        borderBottom: "1px solid #E0E0E0",
        overflowX: "auto",          // enable horizontal scroll
        whiteSpace: "nowrap",       // prevent wrapping
        scrollbarWidth: "none",     // hide scrollbar (Firefox)
        "&::-webkit-scrollbar": {   // hide scrollbar (Chrome/Safari)
          display: "none",
        },
      }}
    >
      {[...new Map(tabsData?.map((item) => [item.label, item])).values()].map(
        (item, index) => (
          <div
            key={index}
            style={getTabStyle(index)}
            onClick={() => handleChange(index)}
          >
            {/* Icon (optional) */}
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>

            {/* Animated underline */}
            <span style={underlineStyle(index)} />
          </div>
        )
      )}
    </Components.Box>
  );
};
