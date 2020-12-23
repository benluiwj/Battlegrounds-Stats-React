import React from "react";

export const TooltipContent = ({payload, label, unit, useTotalProp, formatter, patches}) => {

    if (payload.length === 0) return null;


    const total = useTotalProp ? payload[0].payload.totalCount : payload.reduce((result, entry) => (result + entry.value), 0);

    let patchLabel = null;
    if (patches && label in patches) {
        let patch = patches[label];
        patchLabel = <a href={patch[1]}>{patch[0]}</a>;
    }

    return (
        <div className="recharts-default-tooltip"
             style={{backgroundColor: "rgb(255,255,255)", padding: "10px", border: "1px solid rgb(204, 204, 204)"}}>
            <p className="recharts-tooltip-label" style={{margin: 0, fontWeight: "bold"}}>{label}</p>
            {patchLabel}

            <p className="recharts-tooltip-label" style={{margin: 0}}>{total} {unit}</p>

            {total > 0 &&
            <ul className="recharts-tooltip-item-list" style={{padding: 0, margin: 0}}>
                {
                    payload.map((entry, index) => (
                        <li className="recharts-tooltip-item" key={`item-${index}`}
                            style={{color: entry.color, display: "block"}}>
                            {`${entry.name}: ${formatter ? formatter(entry.value) : entry.value}`}
                        </li>
                    ))
                }
            </ul>
            }
        </div>
    );
};