import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ExpenseAnalytics = ({ data }) => {
    const aggregatedData = data.reduce((acc, current) => {
        acc[current.deputy] = Number((acc[current.deputy] || 0)) + Number(current.valorDocumento);
        // Round to 2 decimal places
        acc[current.deputy] = Math.round(acc[current.deputy] * 100) / 100;
        return acc;
    }, {});

    const formattedData = Object.keys(aggregatedData).map((key, index) => ({ name: key, value: aggregatedData[key] }));
    return (
        <PieChart width={800} height={600}>
            <Pie
                dataKey="value"
                isAnimationActive={false}
                data={formattedData}
                cx="50%"
                cy="50%"
                outerRadius={200}
                fill="#8884d8"
                label>
                {
                    formattedData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
                }
            </Pie>
            <Tooltip />
            {/* <Legend align='center' verticalAlign='bottom' />  */}
        </PieChart>
    );
};

export default ExpenseAnalytics;
