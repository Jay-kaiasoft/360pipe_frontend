import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
import SubuserTypeList from './subuserTypeList';
import { Tabs } from '../../../components/common/tabs/tabs';
import SubUserList from './subUserList';

const tabData = [
    {
        label: 'Sub-Users'
    },
    {
        label: 'Sub-Users Type'
    },
]

const ManageUser = () => {
    const [selectedTab, setSelectedTab] = useState(0);

    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    return (
        <>
            <div>
                <Tabs tabsData={tabData} selectedTab={selectedTab} handleChange={handleChangeTab} />
            </div>

            <div className="mt-6">
                {
                    selectedTab === 0 && <SubUserList/>
                }
                {
                    selectedTab === 1 && <SubuserTypeList/>
                }
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageUser)