import Components from "../../muiComponents/components";
import { useTheme } from "@mui/material";

export const Tabs = ({ selectedTab, handleChange, tabsData, type = "default", center = false, fontSize = null }) => {
  const theme = useTheme();

  return (
    <Components.Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: center ? "center" : "start",
        gap: "20px",
        borderBottom: type === "default" ? "1px solid #E0E0E0" : "none",
        overflowX: "auto",
        whiteSpace: "nowrap",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
        backgroundColor: type === "header" ? "#ffffff" : "transparent",
        fontFamily: '"Inter", sans-serif'
      }}
    >
      {[...new Map(tabsData?.map((item) => [item.label, item])).values()].map(
        (item, index) => {
          const isSelected = selectedTab === index;
          const isHeaderType = type === "header";

          return (
            <Components.Box
              key={index}
              onClick={() => handleChange(index)}
              sx={{
                color: theme.palette.text.primary,
                fontWeight: isSelected ? 600 : 400,
                fontSize: fontSize ? fontSize : "20px",
                textTransform: "none",
                padding: "8px 8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                position: "relative",
                fontFamily: '"Inter", sans-serif',
                transition: "background-color 0.3s ease",
                
                // Keep the background logic for the header type
                backgroundColor: isHeaderType
                  ? isSelected
                    ? "rgba(33, 150, 243, 0.08)"
                    : "transparent"
                  : "transparent",            

                // The Animated Bottom Border
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)", // Centers the line so it grows outward
                  height: isHeaderType ? "3px" : "3px",
                  width: isSelected ? "100%" : "0%", // Full width if selected, 0% if not
                  backgroundColor: theme.palette.secondary.main,
                  transition: "width 0.3s ease-in-out", // The animation effect
                },

                // Triggers the width to expand to 100% on hover
                "&:hover::after": {
                  width: "100%",
                }
              }}
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </Components.Box>
          );
        }
      )}
    </Components.Box>
  );
};


// import Components from "../../muiComponents/components";
// import { useTheme } from "@mui/material";

// export const Tabs = ({ selectedTab, handleChange, tabsData, type = "default", center = false, fontSize = null }) => {
//   const theme = useTheme();

//   const getTabStyle = (index) => {
//     const isSelected = selectedTab === index;
//     const isHeaderType = type === "header";

//     const baseStyle = {
//       color: theme.palette.text.primary,
//       fontWeight: isSelected ? 600 : 400,
//       fontSize: fontSize ? fontSize : "20px",
//       textTransform: "none",
//       padding: "8px 8px",
//       cursor: "pointer",
//       display: "flex",
//       alignItems: "center",
//       gap: "7px",
//       position: "relative",
//       borderBottom: isHeaderType
//         ? isSelected
//           ? `3px solid ${theme.palette.secondary.main}`
//           : "3px solid transparent"
//         : "none",
//       backgroundColor: isHeaderType
//         ? isSelected
//           ? "rgba(33, 150, 243, 0.08)"
//           : "transparent"
//         : "transparent",
//       fontFamily: '"Inter", sans-serif',
//     };

//     // Add hover underline animation only for non‑selected tabs
//     if (!isSelected) {
//       baseStyle["&::after"] = {
//         content: '""',
//         position: "absolute",
//         bottom: 0,
//         left: 0,
//         width: "100%",
//         height: "3px",
//         backgroundColor: theme.palette.secondary.main,
//         transform: "scaleX(0)",
//         transformOrigin: "left",
//         transition: "transform 0.4s ease-in-out",
//       };
//       baseStyle["&:hover::after"] = {
//         transform: "scaleX(1)",
//       };
//     }

//     return baseStyle;
//   };

//   const underlineStyle = (index) => ({
//     content: '""',
//     position: "absolute",
//     bottom: "0",
//     left: "0",
//     height: "3px",
//     width: selectedTab === index ? "100%" : "0%",
//     backgroundColor: theme.palette.secondary.main,
//     transition: "width 0.3s ease",
//     fontFamily: '"Inter", sans-serif'
//   });

//   return (
//     <Components.Box
//       sx={{
//         width: "100%",
//         display: "flex",
//         justifyContent: center ? "center" : "start",
//         gap: "20px",
//         borderBottom: type === "default" ? "1px solid #E0E0E0" : "none",
//         overflowX: "auto",
//         whiteSpace: "nowrap",
//         scrollbarWidth: "none",
//         "&::-webkit-scrollbar": { display: "none" },
//         backgroundColor: type === "header" ? "#ffffff" : "transparent",
//         fontFamily: '"Inter", sans-serif'
//       }}
//     >
//       {[...new Map(tabsData?.map((item) => [item.label, item])).values()].map(
//         (item, index) => (
//           <Components.Box
//             key={index}
//             sx={getTabStyle(index)}
//             onClick={() => handleChange(index)}
//           >
//             {item.icon && <span>{item.icon}</span>}
//             <span>{item.label}</span>

//             {type === "default" && <span style={underlineStyle(index)} />}
//           </Components.Box>
//         )
//       )}
//     </Components.Box>
//   );
// };