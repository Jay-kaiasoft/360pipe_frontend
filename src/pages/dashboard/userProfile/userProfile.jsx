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
    const userdata = getUserDetails();
    const [tabsData, setTabsData] = useState([]);

    const [selectedTab, setSelectedTab] = useState(0);
    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    useEffect(() => {
        if (userdata?.rolename === 'Sales Representative') {
            setTabsData([
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
            ])
        } else {
            setTabsData([
                {
                    label: 'Profile', icon: <CustomIcons iconName="fa-solid fa-circle-user" />
                },               
                {
                    label: 'Security', icon: <CustomIcons iconName="fa-solid fa-shield-halved" />
                },
                {
                    label: 'Change Password', icon: <CustomIcons iconName="fa-solid fa-lock" />
                },                
            ])
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