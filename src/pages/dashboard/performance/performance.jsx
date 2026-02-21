import React from 'react'
import { connect } from 'react-redux'
import { setPerformanceSelectedTabIndex } from '../../../redux/commonReducers/commonReducers'
import Activities from '../activities/activities'
import Results from '../results/results'

const Performance = ({ setPerformanceSelectedTabIndex, performanceSelectedTabIndex }) => {
    return (
        <>
            {
                performanceSelectedTabIndex === 0 && (
                    <Activities/>
                )
            }
            {
                performanceSelectedTabIndex === 1 && (
                    <Results/>
                )
            }
        </>
    )
}

const mapStateToProps = (state) => ({
    performanceSelectedTabIndex: state.common.performanceSelectedTabIndex,
})

const mapDispatchToProps = {
    setPerformanceSelectedTabIndex
}

export default connect(mapStateToProps, mapDispatchToProps)(Performance)