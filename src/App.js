import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons'

import Main from "./pages/landingPage/main";
import PageNotFound from "./components/pageNotFound/pageNotFound";
import PricingSection from "./pages/landingPage/pricingSection";
import MuiThemeProvider from "./components/common/muiTheme/muiTheme";
import GlobalAlert from "./components/common/alert/globalAlert";
import Register from "./pages/auth/register/register";
import Loader from "./components/loader/loader";
import Login from "./pages/auth/login/login";
import ForgotPassword from "./pages/auth/forgotPassword/forgotPassword";
import ResetPassword from "./pages/auth/resetPassword/resetPassword";

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
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/forgotpassword",
      element: <ForgotPassword />,
    },
    {
      path: "/resetpassword/:token",
      element: <ResetPassword />,
    },
  ])
  return (
    <>
      <MuiThemeProvider>
        <div className="h-screen">
          <Loader />
          <GlobalAlert />
          <RouterProvider router={router} />
        </div>
      </MuiThemeProvider>
    </>
  )
}

export default App