import { useForm } from "react-hook-form";
import { getAllOpportunitiesContact } from "../../../service/opportunities/opportunitiesContactService";
import { getOpportunityDetails } from "../../../service/opportunities/opportunitiesService";
import { useEffect, useState } from "react";
import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";

const OpportunitiesInfo = ({ isOpen, opportunityId, handleClose }) => {
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);
    const [economicBuyerContacts, setEconomicBuyerContacts] = useState([]);

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
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                    <h2 className="text-lg font-bold text-gray-800">
                        {watch("accountName")} Opt 360
                    </h2>
                    <Components.IconButton onClick={handleClose}>
                        <CustomIcons
                            iconName={"fa-solid fa-close"}
                            css="cursor-pointer h-6 w-6 text-black"
                        />
                    </Components.IconButton>
                </div>

                {/* MEDDIC Content */}
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
                                                {c.title && (
                                                    <>
                                                        <span className="mx-1 text-gray-500">–</span>
                                                        <span>{c.title}</span>
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
                                                {c.title && (
                                                    <>
                                                        <span className="mx-1 text-gray-500">–</span>
                                                        <span>{c.title}</span>
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
            </div>
        </>
    );
};

export default OpportunitiesInfo;
