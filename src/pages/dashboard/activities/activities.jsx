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
        },
        {
            field: 'old_meetings',
            headerName: 'Existing Meetings',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
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
                    height={600}
                    hideFooter={true}
                />
                {/* <table className="border-collapse w-full">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-[#D9D9D9] text-black">
                            <th className="px-4 py-1 text-left text-sm font-semibold">Rep</th>
                            <th className="px-4 py-1 text-left text-sm font-semibold">Pipe</th>
                            <th className="px-4 py-1 text-left text-sm font-semibold w-40">Rev</th>
                        </tr>
                    </thead>

                    <tbody>
                        {results?.map((row, i) => (
                            <tr key={i} className="odd:bg-white even:bg-gray-200">
                                <td className="px-4 py-1 text-sm">
                                    {row.rep_name || '—'}
                                </td>
                                <td className="px-4 py-1 text-sm">
                                    {moneyLabel(row.pipelineTotal) || '—'}
                                </td>
                                <td className="px-4 py-1 text-sm">
                                     {moneyLabel(row.rev) || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table> */}
            </div>
        </>
    )
}

export default Activities