import { useForm } from "react-hook-form";
import { getAllOpportunitiesContact } from "../../../service/opportunities/opportunitiesContactService";
import { getOpportunityDetails } from "../../../service/opportunities/opportunitiesService";
import { useEffect, useState } from "react";
import Components from "../../../components/muiComponents/components";
import CustomIcons from "../../../components/common/icons/CustomIcons";

const OpportunitiesInfo = ({ isOpen, opportunityId, handleClose }) => {
    const [opportunitiesContacts, setOpportunitiesContacts] = useState([]);

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
            setOpportunitiesContacts(list?.filter((row) => row.isKey === true));
        }
    };

    useEffect(() => {
        handleGetOpportunityDetails();
        handleGetOppContacts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

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
                    border-l border-gray-300 w-[700px]
                    flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    shadow-xl
                    ${isOpen ? "translate-x-0" : "translate-x-full"}
                `}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300">
                    <h2 className="text-lg font-bold text-gray-800">
                        {watch("accountName")} Opt 360
                    </h2>
                    <Components.IconButton onClick={handleClose}>
                        <CustomIcons
                            iconName={'fa-solid fa-close'}
                            css='cursor-pointer h-6 w-6 text-black'
                        />
                    </Components.IconButton>
                </div>

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

                            {opportunitiesContacts && opportunitiesContacts.length > 0 ? (
                                <ul className="space-y-1 text-sm">
                                    {opportunitiesContacts.map((c) => (
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
            </div >
        </>
    );
};

export default OpportunitiesInfo;