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
                    height={580}
                    hideFooter={true}
                />              
            </div>
        </>
    )
}

export default Results