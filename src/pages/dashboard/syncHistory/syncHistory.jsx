import React, { useEffect, useState } from 'react'
import { getSyncHistory } from '../../../service/syncRecords/syncRecordsService';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import { handleConvertUTCDateToLocalDate, userTimeZone } from '../../../service/common/commonService';

const SyncHistory = () => {
    const [syncHistory, setSyncHistory] = useState([])

    // Group records by only date (ignore time)
    const groupByDate = (records) => {
        const groups = {};
        records.forEach(record => {
            // Ensure dateOnly is a string
            let dateOnly = handleConvertUTCDateToLocalDate(record.date);
            if (dateOnly instanceof Date) {
                dateOnly = dateOnly.toLocaleDateString(); // or use toLocaleString() if you want time
            }
            console.log("dateOnly",dateOnly)
            if (!groups[dateOnly]) {
                groups[dateOnly] = [];
            }
            groups[dateOnly].push(record);
        });
        return groups;
    };

    const handleGetSyncHistory = async () => {
        try {
            const history = await getSyncHistory();
            if (history?.status === 200) {
                setSyncHistory(history.result?.reverse() || []);
            }
        } catch (error) {
            console.error("Error fetching sync history:", error);
        }
    }
    useEffect(() => {
        handleGetSyncHistory();
    }, []);

    // Prepare grouped data
    const groupedHistory = groupByDate(syncHistory);

    return (
        <>
            <div className="bg-white p-6 rounded shadow-md">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800">Sync History</h2>
                </div>
                {
                    Object?.keys(groupedHistory)?.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <CustomIcons iconName={'fa-solid fa-clock-rotate-left'} css={'text-4xl text-gray-400 mb-4'} />
                            <p className="text-gray-500">No sync history available.</p>
                        </div>
                    )
                }
                <div className="relative">
                    {Object?.entries(groupedHistory).map(([date, records], groupIdx) => (
                        <div key={groupIdx} className="relative">
                            {/* Date header */}
                            <div className="flex justify-start items-center gap-2 my-4">
                                <CustomIcons iconName={'fa-solid fa-link'} css={'text-lg'} />
                                <p className="text-base font-semibold text-gray-700">{date}</p>
                            </div>

                            {/* Records with vertical line inside */}
                            <div className="relative">
                                {/* Vertical line only for this date group */}
                                <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300"></div>

                                {/* Each record */}
                                <div className="flex flex-col gap-3">
                                    {records.map((record, recIdx) => (
                                        <div key={recIdx} className="relative pl-6">
                                            {/* Small dot on line
                                            <div className="absolute left-0 top-6 w-3 h-3 rounded-full bg-gray-400"></div> */}

                                            <div className="border rounded-md p-3 flex justify-between items-center gap-3">
                                                <div className="grow flex flex-col gap-1">
                                                    <p className="text-sm text-gray-600">
                                                        {record.operationType} - {record.subject}
                                                    </p>
                                                    <p className="text-sm text-gray-800">{record.createdByName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {
                                                            (() => {
                                                                let dateStr = handleConvertUTCDateToLocalDate(record.date);
                                                                return dateStr.toLocaleString("en-IN", { timeZone: userTimeZone });
                                                            })()
                                                        }
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {record.syncType === 'PULL' ? (
                                                        <CustomIcons iconName={'fa-solid fa-download'} css={'text-lg text-blue-500'} />
                                                    ) : (
                                                        <CustomIcons iconName={'fa-solid fa-upload'} css={'text-lg text-green-500'} />
                                                    )}
                                                    <p
                                                        className={`text-sm ${record.syncType === 'PULL' ? 'text-blue-500' : 'text-green-500'}`}
                                                    >
                                                        {record.syncType}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </>
    )
}

export default SyncHistory