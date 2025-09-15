import { useState } from "react";
import { Tabs } from "../../../components/common/tabs/tabs";
import CustomIcons from "../../../components/common/icons/CustomIcons";
import Profile from "./profile";
import Brand from "./brand";
import Security from "./security";
import ChangePassword from "./changePassword";
import CreditCard from "./creditCard";

const tabData = [
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
        label: 'Change Passowrd', icon: <CustomIcons iconName="fa-solid fa-lock" />
    },
    {
        label: 'Credit Card Details', icon: <CustomIcons iconName="fa-solid fa-credit-card" />
    },
]

const UserProfile = () => {

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