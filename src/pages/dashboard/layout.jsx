import { Outlet, useNavigate } from "react-router"
import { connect } from "react-redux"
import AlertDialog from "../../components/common/alertDialog/alertDialog"

import AppHeader from "./appHeader/appHeader"
import SideBar from "./sideBar/sideBar"
import BackDrop from "./sideBar/backDrop"

const Layout = ({ isExpanded, isHovered, isMobileOpen, sessionEndModel }) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <div>
        <SideBar />
        <BackDrop />
      </div>

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[80px]"} ${isMobileOpen ? "ml-0" : ""}`}
      >
        <AppHeader />

        <main className="p-4 max-w-screen-2xl">
          <Outlet />
        </main>
      </div>
      <AlertDialog
        open={sessionEndModel}
        title="Session Expired"
        message="Your session has expired. Please log in again to continue."
        actionButtonText="Login"
        handleAction={() => navigate('/login')}
        closeIcon={false}
      />

    </div>
  )
}

const mapStateToProps = (state) => ({
  isExpanded: state.common.isExpanded,
  isHovered: state.common.isHovered,
  isMobileOpen: state.common.isMobileOpen,
  sessionEndModel: state.common.sessionEndModel,
})

export default connect(mapStateToProps)(Layout)
