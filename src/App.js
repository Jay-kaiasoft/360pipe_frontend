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
import Layout from "./pages/dashboard/layout";
import Accounts from "./pages/dashboard/accounts/accounts";
import { useEffect, useState } from "react";
import { setLoading } from "./redux/commonReducers/commonReducers";
import { connect } from "react-redux";
import Opportunities from "./pages/dashboard/opportunities/opportunities";
library.add(fas, far, fab)

const App = ({ setLoading }) => {
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
    {
      path: "/dashboard",
      element: <Layout />,
      children: [
        {
          path: "accounts",
          element: <Accounts />,
        },
        {
          path: "opportunities",
          element: <Opportunities />,
        },
      ],
    },
  ])

  const [bootLoading, setBootLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
      setBootLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (bootLoading) {
    return <div className="h-screen">
      <Loader />
    </div>;
  }
  return (
    <>
      <MuiThemeProvider>
        <div className="h-screen">
          <Loader />
          <GlobalAlert />
          <RouterProvider router={router} fallbackElement={<Loader />} />
        </div>
      </MuiThemeProvider>
    </>
  )
}
const mapDispatchToProps = {
  setLoading,
}
export default connect(null, mapDispatchToProps)(App);