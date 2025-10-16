import React, { useEffect, useState } from 'react'
import { getAllScrapingRequests } from '../../service/emailScrapingRequest/emailScrapingRequest';
import DataTable from '../../components/common/table/table';
import CustomIcons from '../../components/common/icons/CustomIcons';


const StatusIcon = ({ value }) => {
    if (value === 0) {
        // waiting
        return (
            <span title="Pending" className="pulse-glow">
                <CustomIcons iconName="fa-solid fa-hourglass-start" css="text-yellow-500 text-xl" />
            </span>
        );
    }
    if (value === 2) {
        // processing
        return (
            <span title="Processing" className="">
                {/* use FA built-in spin or Tailwind animate-spin (pick one). Using FA here: */}
                <CustomIcons iconName="fa-solid fa-spinner fa-spin" css="text-blue-500 text-xl" />
            </span>
        );
    }
    // done
    return (
        <span title="Completed" className="pop-in">
            <CustomIcons iconName="fa-solid fa-circle-check" css="text-green-500 text-xl" />
        </span>
    );
};

const MailScrapingRequests = () => {
    const [mails, setMails] = useState([]);

    const handleGetAllMails = async () => {
        const res = await getAllScrapingRequests();
        if (res?.status === 200) {
            const mailsWithId = res.result.map((mail, index) => ({
                rowId: index + 1,
                email: mail.email || "-",
                maxMessages: mail.maxMessages || "-",
                status: mail.status || "-",
            }));
            setMails(mailsWithId);
        }
    }

    useEffect(() => {
        handleGetAllMails();
    }, [])

    const columns = [
        {
            field: 'rowId',
            headerName: '#',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 70,
            sortable: false,
        },
        {
            field: 'email',
            headerName: 'Sender Email',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 180,
            sortable: false,
        },
        {
            field: 'maxMessages',
            headerName: 'Max Messages',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150
        },
        {
            field: 'status',
            headerName: 'Status',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150,
            sortable: false,
            renderCell: (params) => (
                <div className="flex justify-center items-center w-full">
                    <StatusIcon value={parseInt(params.value)} />
                </div>
            ),
        }
    ];

    const getRowId = (row) => {
        return row.rowId;
    }

    return (
        <>
            <div className='border rounded-lg bg-white mt-4'>
                <DataTable columns={columns} rows={mails} getRowId={getRowId} height={550} />
            </div>
        </>
    )
}

export default MailScrapingRequests