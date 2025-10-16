import React, { useEffect, useState } from 'react'
import DataTable from '../../components/common/table/table';

import { getAllTempMails } from '../../service/tempMail/tempMail';
import MailScraper from './mailScraper';
import { Tabs } from '../../components/common/tabs/tabs';
import MailScrapingRequests from './mailScrapingRequests';

const tableData = [
    { label: 'Mail Scraping Requests' },
    { label: 'Mails' },
    { label: 'Mail Scraper' },
]

const ManageMails = () => {
    const [mails, setMails] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);

    const handleChangeTab = (value) => {
        setSelectedTab(value);
    }

    const handleGetAllMails = async () => {
        const res = await getAllTempMails();
        if (res?.status === 200) {
            const mailsWithId = res.result.map((mail, index) => ({
                // ...mail,
                rowId: index + 1,
                email: mail.email || "-",
                companyName: mail.companyName || "-",
                jobTitle: mail.jobTitle || "-",
                website: mail.website || "-",
                phone: mail.phone || "-",
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
            field: 'companyName',
            headerName: 'Company Name',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'website',
            headerName: 'Website',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 210
        },
        {
            field: 'phone',
            headerName: 'Phone',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 150
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    }

    return (
        <>
            <div>
                <Tabs tabsData={tableData} selectedTab={selectedTab} handleChange={handleChangeTab} />
            </div>
            {
                selectedTab === 0 && <MailScrapingRequests />
            }
            {
                selectedTab === 1 &&
                (
                    <div className='border rounded-lg bg-white mt-4'>
                        <DataTable columns={columns} rows={mails} getRowId={getRowId} height={550} />
                    </div>
                )
            }
            {
                selectedTab === 2 && <MailScraper />
            }
        </>
    )
}

export default ManageMails