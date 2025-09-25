import React, { useState } from 'react'
import { setAlert } from '../../../redux/commonReducers/commonReducers';
import { connect } from 'react-redux';
// import SubuserTypeList from './subuserTypeList';
import { Tabs } from '../../../components/common/tabs/tabs';
import Accounts from './accounts';
import AccountTypeList from './accountTypeList';

const tabData = [
    {
        label: 'Accounts'
    },
    {
        label: 'Accounts Type'
    },
]

const ManageAccounts = () => {
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
                    selectedTab === 0 && <Accounts/>
                }
                {
                    selectedTab === 1 && <AccountTypeList/>
                }
            </div>
        </>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageAccounts)