import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";

import { getAllOpportunitiesContact } from "../../../service/opportunities/opportunitiesContactService";
import { getOpportunityDetails } from "../../../service/opportunities/opportunitiesService";
import Dropdown from "../../../components/common/dropdown/dropdown";

const OpportunitiesInfo = ({ isOpen, opportunityId, handleClose }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);

    const [opportunitiesKeyContact, setOpportunitiesKeyContacts] = useState([]);
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);
    const [economicBuyerContacts, setEconomicBuyerContacts] = useState([]);
    const [selectedType, setSelectedType] = useState("Opp360")

    const handleOpen = (event) => {
        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu = () => setMenuAnchor(null);

    const {
        reset,
        watch,
    } = useForm({
        defaultValues: {
            nextSteps: null,
            whyDoAnything: null,
            businessValue: null,
            currentEnvironment: null,
            decisionMap: null,
            decisionCriteria: null,
            logo: null
        },
    });

    const handleGetOpportunityDetails = async () => {
        if (opportunityId && isOpen) {
            const res = await getOpportunityDetails(opportunityId);
            if (res?.status === 200) {
                reset(res?.result);
            }
        }
    };

    const handleGetOppContacts = async () => {
        if (isOpen && opportunityId) {
            const res = await getAllOpportunitiesContact(opportunityId);
            const list = Array.isArray(res?.result) ? res.result : [];
            setEconomicBuyerContacts(list?.filter((row) => row.role?.toLowerCase() === "economic buyer"));
            setOpportunitiesKeyContacts(list?.filter((row) => row.isKey === true));
            setOpportunitiesContacts(list)

        }
    };

    useEffect(() => {
        handleGetOpportunityDetails();
        handleGetOppContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);


    const MeddicRow = ({ letter, children }) => (
        <div className="flex border-b-[7px] border-[#ECECEC] last:border-b-0">
            <div className="w-16 bg-[#0478DC] flex items-center justify-center">
                <span className="text-white text-2xl font-bold">{letter}</span>
            </div>
            <div className="flex-1 p-4 bg-white">
                {children}
            </div>
        </div>
    );

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 lg:bg-black/20"
                    onClick={handleClose}
                />
            )}

            <div
                className={`
                    fixed top-0 right-0 z-50 mt-16 lg:mt-0
                    bg-white text-gray-900 h-screen
                    border-l border-gray-300 w-[600px]
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    shadow-xl
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                    <div className="flex justify-start items-center gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center overflow-hidden bg-white">
                            {watch("logo") ? (
                                <a href={watch("logo")} target="_blank" rel="noreferrer">
                                    <img
                                        src={watch("logo")}
                                        alt="Opp Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            ) : (
                                <h2 className="text-lg font-bold text-gray-800 capitalize">
                                    {watch("accountName")?.slice(0,3)[0]}
                                </h2>
                            )}
                        </div>

                        {/* Name + menu */}
                        <h2 className="text-lg font-bold text-gray-800">
                            {watch("accountName")}
                        </h2>

                        <div className="flex justify-start items-center gap-2">
                            <span className="text-sm text-gray-600">
                                {selectedType}
                            </span>

                            <Components.IconButton onClick={handleOpen}>
                                <CustomIcons
                                    iconName="fa-solid fa-angle-down"
                                    css="cursor-pointer h-4 w-4 text-black"
                                />
                            </Components.IconButton>

                            <Dropdown
                                value={selectedType}
                                onChange={(val) => setSelectedType(val)}
                                anchorEl={menuAnchor}
                                setAnchorEl={setMenuAnchor}
                                options={[
                                    { label: "Opp360", value: "Opp360" },
                                    { label: "MEDDIC", value: "MEDDIC" },
                                ]}
                            />
                        </div>
                    </div>

                    <Components.IconButton onClick={handleClose}>
                        <CustomIcons
                            iconName={"fa-solid fa-close"}
                            css="cursor-pointer h-6 w-6 text-black"
                        />
                    </Components.IconButton>
                </div>

                {
                    selectedType === "Opp360" && (
                        <div className="flex-1 px-4 py-3 overflow-y-auto overflow-x-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-[360px]">
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                                        Why Do Anything
                                    </h3>
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("whyDoAnything") ||
                                                "<span class='text-gray-400 italic'>No information added yet.</span>",
                                        }}
                                    />
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                                        Current Environment
                                    </h3>
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("currentEnvironment") ||
                                                "<span class='text-gray-400 italic'>No information added yet.</span>",
                                        }}
                                    />
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                                        Value
                                    </h3>
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("businessValue") ||
                                                "<span class='text-gray-400 italic'>No value summary added yet.</span>",
                                        }}
                                    />
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                                        Key Contacts
                                    </h3>

                                    {opportunitiesKeyContact && opportunitiesKeyContact.length > 0 ? (
                                        <ul className="space-y-1 text-sm">
                                            {opportunitiesKeyContact.map((c) => (
                                                <li key={c.id}>
                                                    <span className="font-medium text-indigo-600">
                                                        {c.contactName}
                                                    </span>
                                                    {c.role && (
                                                        <>
                                                            <span className="mx-1 text-gray-500">–</span>
                                                            <span>{c.role}</span>
                                                        </>
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            No contacts linked to this opportunity.
                                        </p>
                                    )}
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                                        Decision Map
                                    </h3>
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("decisionMap") ||
                                                "<span class='text-gray-400 italic'>No information added yet.</span>",
                                        }}
                                    />
                                </div>

                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-5 py-4 flex flex-col">
                                    <h3 className="text-base font-semibold text-gray-800 mb-2">
                                        Next Steps
                                    </h3>
                                    {watch("nextSteps") ? (
                                        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                                            {watch("nextSteps")}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">
                                            No next steps defined.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                }
                {
                    selectedType === "MEDDIC" && (
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div className="max-w-3xl mx-auto border-[7px] border-[#ECECEC] bg-white">
                                {/* M - Metrics */}
                                <MeddicRow letter="M">
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("businessValue") ||
                                                "<span class='text-gray-400 italic'>-</span>",
                                        }}
                                    />
                                </MeddicRow>

                                {/* E - Economic Buyer */}
                                <MeddicRow letter="E">
                                    {
                                        economicBuyerContacts?.length > 0 ? (
                                            // <div className="space-y-1 text-sm text-gray-800">
                                            <ul className="space-y-1 text-sm">
                                                {economicBuyerContacts?.map((c) => (
                                                    <li key={c.id}>
                                                        <span className="font-medium text-indigo-600">
                                                            {c.contactName}
                                                        </span>
                                                        {c.role && (
                                                            <>
                                                                <span className="mx-1 text-gray-500">–</span>
                                                                <span>{c.role}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            // </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">
                                                -
                                            </p>
                                        )
                                    }
                                </MeddicRow>

                                {/* D - Decision Criteria */}
                                <MeddicRow letter="D">
                                    N/A
                                </MeddicRow>

                                {/* D - Decision Process */}
                                <MeddicRow letter="D">
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("decisionMap") ||
                                                "<span class='text-gray-400 italic'>-</span>",
                                        }}
                                    />
                                </MeddicRow>

                                <MeddicRow letter="I">
                                    <div
                                        className="text-sm text-gray-700 leading-relaxed space-y-1"
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                watch("whyDoAnything") ||
                                                "<span class='text-gray-400 italic'>-</span>",
                                        }}
                                    />
                                </MeddicRow>

                                {/* C - Champion */}
                                <MeddicRow letter="C">
                                    {
                                        opportunitiesContacts?.length > 0 ? (
                                            // <div className="space-y-1 text-sm text-gray-800">
                                            <ul className="space-y-1 text-sm">
                                                {opportunitiesContacts?.map((c) => (
                                                    <li key={c.id}>
                                                        <span className="font-medium text-indigo-600">
                                                            {c.contactName}
                                                        </span>
                                                        {c.role && (
                                                            <>
                                                                <span className="mx-1 text-gray-500">–</span>
                                                                <span>{c.role}</span>
                                                            </>
                                                        )}
                                                    </li>
                                                ))}
                                            </ul>
                                            // </div>
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">
                                                -
                                            </p>
                                        )
                                    }
                                </MeddicRow>
                            </div>
                        </div>
                    )
                }
            </div>
        </>
    );
};

export default OpportunitiesInfo;
