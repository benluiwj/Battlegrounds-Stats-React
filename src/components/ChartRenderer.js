import React from "react";
import {useQuery} from "@apollo/react-hooks";
import {Col, Row, Spin, Statistic} from "antd";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {ExpandableTable, ExpandableRow} from "./ExpandableTable";
import moment from "moment";
import {dateTimeFormatter} from "../utilities/utilities";
import DashWrapper from "./DashWrapper";

const dateFormatter = item => {
    return moment(item).format("MMM DD, YYYY")
};

const xAxisFormatter = (item) => {
    if (moment(item).isValid()) {
        return dateFormatter(item)
    } else {
        return item;
    }
};

const toPercent = (decimal, fixed = 0) => `${decimal.toFixed(fixed)}%`;

const TooltipContent = ({payload, label, unit, useTotalProp, formatter}) => {

    if (payload.length === 0) return null;

    const total = useTotalProp ? payload[0].payload.totalCount : payload.reduce((result, entry) => (result + entry.value), 0);

    return (
        <div className="recharts-default-tooltip"
             style={{backgroundColor: "rgb(255,255,255)", padding: "10px", border: "1px solid rgb(204, 204, 204)"}}>
            <p className="recharts-tooltip-label" style={{margin:0, fontWeight:"bold"}}>{label}</p>
            <p className="recharts-tooltip-label" style={{margin:0}}>{total} {unit}</p>
            <ul className="recharts-tooltip-item-list" style={{padding: 0, margin: 0}}>
                {
                    payload.map((entry, index) => (
                        <li className="recharts-tooltip-item" key={`item-${index}`}
                            style={{color: entry.color, display: "block"}}>
                            {`${entry.name}: ${ formatter ? formatter(entry.value) : entry.value}`}
                        </li>
                    ))
                }
            </ul>
        </div>
    );
};


const CartesianChart = ({resultSet, children, ChartComponent}) => (
    <ResponsiveContainer width="100%" height={350}>
        <ChartComponent data={resultSet.data}>
            <XAxis dataKey="x" tickFormatter={xAxisFormatter} minTickGap={20}/>
            <YAxis yAxisId="mmr" type="number" domain={[resultSet.minData, 'auto']} allowDataOverflow={true}
                   label={{value: resultSet.leftAxisLabel, angle: -90, position: 'insideLeft'}}/>

            {resultSet.seriesNames.length > 1 &&
            <YAxis yAxisId="position" type="number" domain={['auto', resultSet.lowestPos]} orientation="right"
                   reversed={true}
                   allowDataOverflow={true} label={{value: 'Position', angle: 90, position: 'insideRight'}}/>
            }
            <CartesianGrid/>
            {children}
            <Legend/>
            <Tooltip labelFormatter={dateTimeFormatter(resultSet.xAxisFormat)}/>
        </ChartComponent>
    </ResponsiveContainer>
);

const colors = [
    "#FF6492", "#141446", "#7A77FF",
    "#5dcdf8", "#506C64", "#77CBB9",
];

const TypeToChartComponent = {
    line: ({resultSet}) => (
        <CartesianChart resultSet={resultSet} ChartComponent={LineChart}>
            {resultSet.seriesNames.map((series, i) => (
                <Line
                    yAxisId={series.axis}
                    key={series.key}
                    dataKey={series.key}
                    name={series.title}
                    stroke={colors[i]}
                />
            ))}
        </CartesianChart>
    ),
    bar: ({resultSet}) => (
        <ResponsiveContainer width="100%" height={350}>
            <BarChart data={resultSet.data}>
                <CartesianGrid/>
                <XAxis dataKey="turn"/>
                <YAxis tickFormatter={toPercent}/>
                <Tooltip formatter={(item) => item.toFixed(0) + "%"} content={<TooltipContent/>} unit="Games" useTotalProp/>
                <Legend/>
                {resultSet.seriesNames.map((series, i) => (
                    <Bar
                        key={series.key}
                        stackId="a"
                        dataKey={series.key}
                        name={series.title}
                        fill={colors[i]}
                    />
                ))}
            </BarChart>
        </ResponsiveContainer>
    ),
    area: ({resultSet}) => (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={resultSet.data}>
                <CartesianGrid/>
                <XAxis dataKey="date"/>
                <YAxis/>
                <Tooltip content={<TooltipContent unit={resultSet.unit}/>}/>
                <Legend/>
                {resultSet.seriesNames.map((series, i) => (
                    <Area
                        key={series.key}
                        stackId="a"
                        dataKey={series.key}
                        name={series.title}
                        stroke={colors[i % 6]}
                        fill={colors[i % 6]}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    ),
    pie: ({resultSet}) => (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                <Pie
                    isAnimationActive={false}
                    data={resultSet.chartPivot()}
                    nameKey="x"
                    dataKey={resultSet.seriesNames()[0].key}
                    fill="#8884d8"
                >
                    {resultSet.chartPivot().map((e, index) => (
                        <Cell key={index} fill={colors[index % colors.length]}/>
                    ))}
                </Pie>
                <Legend/>
                <Tooltip/>
            </PieChart>
        </ResponsiveContainer>
    ),
    number: ({resultSet}) => (
        <Row
            type="flex"
            justify="center"
            align="middle"
            style={{
                height: "100%"
            }}
        >
            <Col>
                {resultSet.seriesNames().map(s => (
                    <Statistic value={resultSet.totalRow()[s.key]}/>
                ))}
            </Col>
        </Row>
    ),
    table: ({resultSet, layoutCallback}) => {
        return (
            <DashWrapper layoutCallback={layoutCallback}
                         pagination={false}
                         columns={resultSet.columns}
                         dataSource={resultSet.data}
                         rowKey={resultSet.key}
                         size="small"
            />
        );
    },
    expandableTable: ExpandableTable,
    expandableRow: ({resultSet}) => (
        <ExpandableRow
            columns={resultSet.columns}
            data={resultSet.data}
            keyField={resultSet.keyField}
            index={resultSet.index}
        />
    )
};


const TypeToMemoChartComponent = Object.keys(TypeToChartComponent)
    .map(key => ({
        [key]: React.memo(TypeToChartComponent[key])
    }))
    .reduce((a, b) => ({...a, ...b}));


const renderChart = Component => ({loading, error, data}) => (process, layoutCallback) => {

    if (loading) return <Spin style={{marginTop: "20px", display: "table", marginLeft: "auto", marginRight: "auto"}}/>;

    if (!data && error) return error.toString();

    if (data) {
        let result = process(data);
        if (result.data.length > 0)
            return <Component resultSet={result} layoutCallback={layoutCallback}/>;
        else {
            return <div style={{textAlign: "center", marginTop: "1rem"}}>No data available
            </div>
        }
    }
};

const ChartRenderer = ({item, layoutCallback, queryResult}) => {
    const {chartType, processData} = item.vizState;
    const component = TypeToMemoChartComponent[chartType];
    let renderProps = queryResult;
    if ("rawQuery" in item) renderProps = useQuery(item.rawQuery);

    let process = processData ? processData : (d) => d;
    return component && renderChart(component)(renderProps)(process, layoutCallback);
};

export default ChartRenderer;
