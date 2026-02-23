import React, { useEffect, useState } from 'react'
import { getUserDetails } from '../../../utils/getUserDetails';
import { deleteQuota, getAllCustomerQuotas } from '../../../service/customerQuota/customerQuotaService';
import Components from '../../../components/muiComponents/components';
import CustomIcons from '../../../components/common/icons/CustomIcons';
import AddQuotaModel from '../../../components/models/subUser/addQuotaModel';
import dayjs from 'dayjs';
import AlertDialog from '../../../components/common/alertDialog/alertDialog';
import { getCustomer } from '../../../service/customers/customersService';
import { connect } from 'react-redux';
import { setAlert } from '../../../redux/commonReducers/commonReducers';

const Quota = ({ setAlert }) => {
    const userdata = getUserDetails();
    const [quota, setQuota] = useState([])
    const [dialog, setDialog] = useState({ open: false, title: '', message: '', actionButtonText: '' });
    const [selectedQuotaId, setSelectedQuotaId] = useState(null)
    const [openModel, setOpenModel] = useState(false)
    const [startEvalPeriod, setStartEvalPeriod] = useState(null)
    const [endEvalPeriod, setEndEvalPeriod] = useState(null)

    const handleOpenModel = (id = null) => {
        setSelectedQuotaId(id)
        setOpenModel(true)
    }

    const handleCloseModel = () => {
        setSelectedQuotaId(null)
        setOpenModel(false)
    }


    const handleOpenDeleteDialog = (id) => {
        setSelectedQuotaId(id);
        setDialog({ open: true, title: 'Delete Contact', message: 'Are you sure! Do you want to delete this quota?', actionButtonText: 'yes' });
    }

    const handleCloseDeleteDialog = () => {
        setSelectedQuotaId(null);
        setDialog({ open: false, title: '', message: '', actionButtonText: '' });
    }

    const handleDeleteQuota = async () => {
        const res = await deleteQuota(selectedQuotaId);
        if (res.status === 200) {
            handleGetAllQuotas();
            handleCloseDeleteDialog();
        } else {
            setAlert({
                open: true,
                message: res?.message || "Failed to delete contact",
                type: "error"
            });
        }
    }

    const handleGetUser = async () => {
        if (userdata?.userId) {
            const response = await getCustomer(userdata?.userId);
            if (response?.data?.status === 200) {
                if (response?.data?.result?.calendarYearType) {
                    setStartEvalPeriod(response?.data?.result?.startEvalPeriod)
                    setEndEvalPeriod(response?.data?.result?.endEvalPeriod)
                } else {
                    const currentYear = dayjs().year();
                    const firstDay = dayjs(`${currentYear}-01-01`).format("MM/DD/YYYY");
                    const lastDay = dayjs(`${currentYear}-12-31`).format("MM/DD/YYYY");
                    setStartEvalPeriod(firstDay)
                    setEndEvalPeriod(lastDay)
                }
            }
        }
    }
    const handleGetAllQuotas = async () => {
        if (userdata?.userId) {
            const res = await getAllCustomerQuotas(userdata?.userId)
            setQuota(res?.result)
        }
    }
    useEffect(() => {
        handleGetUser()
        handleGetAllQuotas()
    }, [])
    return (
        <div className='flex justify-center items-center'>
            <div className="overflow-y-auto w-96 md:w-[600px]">
                {/* Title bar */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-[22px] font-semibold"></h3>

                    <div className='bg-green-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                        <Components.IconButton onClick={() => handleOpenModel()}>
                            <CustomIcons iconName={'fa-solid fa-plus'} css='cursor-pointer text-white h-4 w-4' />
                        </Components.IconButton>
                    </div>
                </div>

                {/* Table */}
                <div className="border rounded-md overflow-hidden">
                    <table className="border-collapse w-full">
                        {/* Header */}
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-[#0478DC] text-white">
                                <th className="px-4 py-3 text-left text-sm font-semibold w-12">#</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold">Term</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold">Quota</th>
                                <th className="px-4 py-3 text-right text-sm font-semibold w-32">Action</th>
                            </tr>
                        </thead>

                        {/* Body */}
                        {quota?.length > 0 ? (
                            <tbody>
                                {quota.map((row, i) => (
                                    <tr key={row.id ?? i} className="odd:bg-white even:bg-gray-200">
                                        <td className="px-4 py-3 text-sm font-bold">{i + 1}</td>
                                        <td className="px-4 py-3 text-sm">{row.term || '—'}</td>
                                        <td className="px-4 py-3 text-right text-sm">${row.quota?.toLocaleString('en-US') || '—'}</td>
                                        <td className="px-4 py-3">
                                            <div className='flex items-center gap-2 justify-end h-full'>
                                                <div className='bg-[#2753AF] h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleOpenModel(row.id)}>
                                                        <CustomIcons iconName={'fa-solid fa-pen-to-square'} css='cursor-pointer text-white h-4 w-4' />
                                                    </Components.IconButton>
                                                </div>
                                                <div className='bg-red-600 h-8 w-8 flex justify-center items-center rounded-full text-white'>
                                                    <Components.IconButton onClick={() => handleOpenDeleteDialog(row.id)}>
                                                        <CustomIcons iconName={'fa-solid fa-trash'} css='cursor-pointer text-white h-4 w-4' />
                                                    </Components.IconButton>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        ) : (
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-4 text-center text-sm font-semibold"
                                    >
                                        No records
                                    </td>
                                </tr>
                            </tbody>
                        )}
                    </table>
                </div>
            </div>

            <AddQuotaModel open={openModel} handleClose={handleCloseModel} customerId={userdata?.userId} id={selectedQuotaId} startEvalPeriod={startEvalPeriod} endEvalPeriod={endEvalPeriod} handleGetUser={handleGetUser} handleGetAllQuota={handleGetAllQuotas} />
            <AlertDialog
                open={dialog.open}
                title={dialog.title}
                message={dialog.message}
                actionButtonText={dialog.actionButtonText}
                handleAction={() => handleDeleteQuota()}
                handleClose={() => handleCloseDeleteDialog()}
            />
        </div>
    )
}

const mapDispatchToProps = {
    setAlert,
};

export default connect(null, mapDispatchToProps)(Quota)