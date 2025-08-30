import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons'

import Main from "./pages/landingPage/main";
import PageNotFound from "./components/pageNotFound/pageNotFound";
import PricingSection from "./pages/landingPage/pricingSection";
import Register from "./pages/auth/register/register";
import MuiThemeProvider from "./components/common/muiTheme/muiTheme";

library.add(fas, far, fab)

const App = () => {
  const router = createBrowserRouter([
    {
      path: "*",
      element: <PageNotFound />,
    },
    {
      path: "/",
      element: <Main />,
    },
    {
      path: "/pricing",
      element: <PricingSection />,
    },
    {
      path: "/register",
      element: <Register />,
    },
  ])
  return (
    <>
      <MuiThemeProvider>
        <div className="h-screen">
          <RouterProvider router={router} />
        </div>
      </MuiThemeProvider>
    </>
  )
}

export default App