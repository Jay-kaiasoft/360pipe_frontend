import { useEffect, useState } from 'react'
import { getAllActivities } from '../../../service/results/results'
import DataTable from '../../../components/common/table/table';

const Activities = () => {
    const [activities, setActivities] = useState([])

    const handleGetActivites = async () => {
        const res = await getAllActivities()
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1,
            }))
            setActivities(data)
        }
    }

    useEffect(() => {
        handleGetActivites()
    }, [])

    const columns = [
        {
            field: 'rowId',
            headerName: '#',
            headerClassName: 'uppercase',
            flex: 1,
            maxWidth: 50,
            sortable: false,
        },
        {
            field: 'rep_name',
            headerName: 'Rep',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 100,
            sortable: false,
        },
        {
            field: 'contacts',
            headerName: 'New Contacts',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
        },
        {
            field: 'new_meetings',
            headerName: 'New Meetings',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? `${params.value}` : 0}</span>
                )
            }
        },
        {
            field: 'old_meetings',
            headerName: 'Existing Meetings',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? `${params.value}` : 0}</span>
                )
            }
        },
    ];

    const getRowId = (row) => {
        return row.rowId;
    }
    return (
        <>
            <div className='border rounded-lg bg-white w-full lg:w-full'>
                <DataTable
                    columns={columns}
                    rows={activities}
                    getRowId={getRowId}
                    height={580}
                    hideFooter={true}
                />        
            </div>
        </>
    )
}

export default Activities