import { useEffect, useState } from "react";
import { Tabs } from "../../../components/common/tabs/tabs";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Profile from "./profile";
import Brand from "./brand";
import Security from "./security";
import ChangePassword from "./changePassword";
import CreditCard from "./creditCard";
import { getUserDetails } from "../../../utils/getUserDetails";

const UserProfile = () => {
    const data = getUserDetails();

    const [tabsData, setTabsData] = useState([
    {
        label: 'Profile', icon: <CustomIcons iconName="fa-solid fa-circle-user" />
    },
    {
        label: 'Brand', icon: <CustomIcons iconName="fa-solid fa-medal" />
    },
    {
        label: 'Security', icon: <CustomIcons iconName="fa-solid fa-shield-halved" />
    },
    {
        label: 'Change Password', icon: <CustomIcons iconName="fa-solid fa-lock" />
    },
    {
        label: 'Credit Card Details', icon: <CustomIcons iconName="fa-solid fa-credit-card" />
    },
]);

    const [selectedTab, setSelectedTab] = useState(0);
    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    useEffect(() => {
        if (data?.subUser && data?.subUser === true) {
            setTabsData((prev) => prev.filter((tab) => tab.label !== "Brand"));
        }
    }, [])
    return (
        <>
            <div>
                <Tabs tabsData={tabsData} selectedTab={selectedTab} handleChange={handleChangeTab} />
            </div>

            <div className="mt-6">
                {
                    selectedTab === 0 && <Profile />
                }
                {
                    selectedTab === 1 && <Brand />
                }
                {
                    selectedTab === 2 && <Security />
                }
                {
                    selectedTab === 3 && <ChangePassword />
                }
                {
                    selectedTab === 4 && <CreditCard />
                }
            </div>
        </>
    )
}

export default UserProfile