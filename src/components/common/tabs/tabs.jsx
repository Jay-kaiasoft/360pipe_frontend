import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

export const Tabs = ({ selectedTab, handleChange, tabsData, type = "default" }) => {
  const theme = useTheme();

  const getTabStyle = (index) => {
    const isSelected = selectedTab === index;
    const isHeaderType = type === "header";

    return {
      color: isSelected
        ? theme.palette.text.primary
        : theme.palette.text.primary,
      fontWeight: isSelected ? 600 : 400,
      fontSize: "16px",
      textTransform: "none",
      padding: "8px 16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "7px",
      position: "relative",
      borderTop: isHeaderType
        ? isSelected
          ? `3px solid ${theme.palette.secondary.main}`
          : "3px solid transparent"
        : "none",
      backgroundColor: isHeaderType
        ? isSelected
          ? "rgba(33, 150, 243, 0.08)" // light blue background
          : "transparent"
        : "transparent",
      // borderRadius: isHeaderType ? "6px 6px 0 0" : 0,
      // transition: "all 0.3s ease",
      fontFamily: '"Inter", sans-serif'
    };
  };

  const underlineStyle = (index) => ({
    content: '""',
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "2px",
    width: selectedTab === index ? "100%" : "0%",
    backgroundColor: theme.palette.secondary.main,
    transition: "width 0.3s ease",
    fontFamily: '"Inter", sans-serif'
  });

  return (
    <Components.Box
      sx={{
        width: "100%",
        display: "flex",
        gap: "20px",
        borderBottom: type === "default" ? "1px solid #E0E0E0" : "none",
        overflowX: "auto",
        whiteSpace: "nowrap",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        backgroundColor: type === "header" ? "#ffffff" : "transparent",
        // padding: type === "header" ? "8px 0" : 0,
        fontFamily: '"Inter", sans-serif'
      }}
    >
      {[...new Map(tabsData?.map((item) => [item.label, item])).values()].map(
        (item, index) => (
          <div
            key={index}
            style={getTabStyle(index)}
            onClick={() => handleChange(index)}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>

            {type === "default" && <span style={underlineStyle(index)} />}
          </div>
        )
      )}
    </Components.Box>
  );
};
