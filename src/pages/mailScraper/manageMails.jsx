import React, { useEffect, useState } from 'react'
import DataTable from '../../components/common/table/table';

import { getAllTempMails } from '../../service/tempMail/tempMail';
import MailScraper from './mailScraper';
import { Tabs } from '../../components/common/tabs/tabs';
import MailScrapingRequests from './mailScrapingRequests';
import { createAllContact } from '../../service/contact/contactService';
import { connect } from 'react-redux';
import { setAlert } from '../../redux/commonReducers/commonReducers';
import Button from '../../components/common/buttons/button';
import CustomIcons from '../../components/common/icons/CustomIcons';

const tableData = [
    { label: 'E-Mail Scraping Requests' },
    { label: 'E-Mails' },
    { label: 'E-Mail Scraper' },
]

const ManageMails = ({ setAlert }) => {
    const [mails, setMails] = useState([]);
    const [selectedTab, setSelectedTab] = useState(0);
    const [rowSelectionModel, setRowSelectionModel] = useState([]); // <-- array of IDs only


    const handleChangeRowSelectionModel = (newModel) => {
        setRowSelectionModel(newModel);
    }

    const handleChangeTab = (value) => {
        setSelectedTab(value);
        setRowSelectionModel([]); // Clear selection when changing tabs
    }

    const handleGetAllMails = async () => {
        if (selectedTab !== 1) return; // Only fetch mails when the Mails tab is selected
        const res = await getAllTempMails();
        if (res?.status === 200) {
            const mailsWithId = res.result.map((mail, index) => ({
                id: mail.id || null,
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

    const handleCreateAllContacts = async () => {
        // rowSelectionModel contains DataGrid rowIds (row.rowId). Convert to mail.id values expected by the API.
        const selectedMailIds = rowSelectionModel
            .map(rid => {
                const mail = mails.find(m => m.rowId === rid);
                return mail ? mail.id : null;
            })
            .filter(Boolean);

        const res = await createAllContact(selectedMailIds);
        if (res?.status !== 201) {
            setAlert({
                open: true,
                type: 'error',
                message: res?.message || 'Failed to add in contacts.',
            })
        } else {
            handleGetAllMails();
            setRowSelectionModel([]);
        }
    }

    useEffect(() => {
        handleGetAllMails();
    }, [selectedTab])

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
            field: 'jobTitle',
            headerName: 'Job Title',
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

    const actionButtons = () => {
        return (
            <div>
                <Button type={`button`} text={'Add Contact'} onClick={() => handleCreateAllContacts()} startIcon={<CustomIcons iconName="fa-solid fa-plus" css="h-5 w-5" />} />
            </div>
        )
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
                        <DataTable columns={columns} rows={mails} getRowId={getRowId} height={rowSelectionModel?.length > 0 ? 480 : 550} checkboxSelection={true} setRowSelectionModel={handleChangeRowSelectionModel} rowSelectionModel={rowSelectionModel} showButtons={rowSelectionModel?.length > 0} buttons={actionButtons} />
                    </div>
                )
            }
            {
                selectedTab === 2 && <MailScraper />
            }
        </>
    )
}
const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(ManageMails)
