import { Outlet, useLocation, useNavigate } from "react-router"
import { connect } from "react-redux"
import AlertDialog from "../../components/common/alertDialog/alertDialog"

import AppHeader from "./appHeader/appHeader"
import Dashboard from "./dashboard"
import SideBar from "./sideBar/sideBar"
import BackDrop from "./sideBar/backDrop"

const Layout = ({ sessionEndModel }) => {

  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <AppHeader />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar for mobile */}
        <div className="lg:hidden">
          <SideBar />
          <BackDrop />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1">
          <div className="h-full overflow-y-auto">
            <div className="px-4 mx-auto">
              <Outlet />
              {location.pathname === '/dashboard' && <Dashboard />}
            </div>
          </div>
        </main>
      </div>

      <AlertDialog
        open={sessionEndModel}
        title="Session Expired"
        message="Your session has expired. Please log in to continue."
        actionButtonText="Login"
        handleAction={() => navigate('/login')}
        closeIcon={false}
      />
    </div>
  )
}

const mapStateToProps = (state) => ({
  sessionEndModel: state.common.sessionEndModel,
})

export default connect(mapStateToProps)(Layout)