import { connect } from "react-redux";

const Loader = ({ loading }) => {
    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-200 transition-all duration-300 bg-opacity-80">
            <div className="w-16 h-16 relative">
                {/* Dual Ring Loader */}
                <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent border-r-transparent animate-spinDualRing"></div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    loading: state.common.loading,
});

export default connect(mapStateToProps)(Loader);
