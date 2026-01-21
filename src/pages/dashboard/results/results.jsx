import React, { useEffect, useState } from 'react'
import { getAllResults } from '../../../service/results/results'
import DataTable from '../../../components/common/table/table';

const formatMoneyK = (num) => {
    const n = Number(num || 0);
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
    return `${n}`;
};

const moneyLabel = (v) => `$${formatMoneyK(v)}`;

const Results = () => {
    const [results, setResults] = useState([])

    const handleGetResults = async () => {
        const res = await getAllResults()
        if (res?.data?.status === 200) {
            const data = res?.data?.result?.map((item, index) => ({
                ...item,
                rowId: index + 1,
            }))
            setResults(data)
        }
    }

    useEffect(() => {
        handleGetResults()
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
            field: 'pipelineTotal',
            headerName: 'Pipe',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? `${moneyLabel(params.value)}` : '$0'}</span>
                )
            }
        },
        {
            field: 'rev',
            headerName: 'Rev',
            headerClassName: 'uppercase',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <span>{params.value ? `${moneyLabel(params.value)}` : '$0'}</span>
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
                    rows={results}
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

export default Results