import {Layout, Table, Input, Popover, Button} from "antd";
import {QuestionCircleOutlined, DeleteFilled} from '@ant-design/icons';

const {TextArea} = Input;


import Header from "../header/Header";
import React, {useState, useCallback, useRef} from "react";
import {withRouter} from "react-router";
import {getArchetypesFromStorage, saveArchetypes, minionsToArchetype} from "../dashboard/dashItems/Archetypes";

import {DndProvider, useDrag, useDrop, createDndContext} from 'react-dnd';
import {HTML5Backend} from 'react-dnd-html5-backend';

import "./archetype_page.css";

const RNDContext = createDndContext(HTML5Backend);
const type = 'DragableBodyRow';

const DragableBodyRow = ({index, moveRow, className, style, ...restProps}) => {
    const ref = React.useRef();
    const [{isOver, dropClassName}, drop] = useDrop({
        accept: type,
        collect: monitor => {
            const {index: dragIndex} = monitor.getItem() || {};
            if (dragIndex === index) {
                return {};
            }
            return {
                isOver: monitor.isOver(),
                dropClassName: dragIndex < index ? ' drop-over-downward' : ' drop-over-upward',
            };
        },
        drop: item => {
            moveRow(item.index, index);
        },
    });
    const [, drag] = useDrag({
        item: {type, index},
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });
    drop(drag(ref));
    return (
        <tr
            ref={ref}
            className={`${className}${isOver ? dropClassName : ''}`}
            style={{cursor: 'move', ...style}}
            {...restProps}
        />
    );
};

function escapeCommas(text) {
    if (text.includes(",")) return `"${text}"`;
    else return text;
}

function stringToList(text) {
    let matches = text.matchAll(/(\w[\w\s]*)|"([\w\s,]+)"/g);
    const result = Array.from(matches, m => m[1]);
    return result
}

function ArchetypePage() {

    const criteriaHelper = <div>
        This can be one of the below options:
        <div><span style={{fontWeight: "600"}}>Minion Type:</span> ELEMENTAL, MURLOC, MECHANICAL, DRAGON, PIRATE, BEAST,
            DEMON, NEUTRAL</div>
        <div><span style={{fontWeight: "600"}}>Minion Attribute:</span> e.g. Divine Shield, Deathrattle</div>
        <div><span style={{fontWeight: "600"}}>Specific Minion:</span> e.g. Majordomo Executus, "Nomi, Kitchen
            Nightmare"
        </div>
        <div>Note: Full minion names must be used. If there is a comma, use quotes around the name.</div>
    </div>;

    const otherCriteriaTitle = <>Other Criteria <Popover content={criteriaHelper}><QuestionCircleOutlined
        style={{marginLeft: "1em"}}/></Popover></>;

    const columns = [{
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        width: "12em",
    }, {
        title: 'Required Minions',
        dataIndex: 'required',
        key: 'required',
        width: "18em",
    }, {
        title: otherCriteriaTitle,
        dataIndex: 'optional',
        key: 'optional',
    }, {
        title: '# Minions Meeting Criteria',
        dataIndex: 'optionalCount',
        key: 'optionalCount',
        width: "6em",
    }, {
        title: 'Delete',
        dataIndex: 'delete',
        key: 'delete',
        width: "6em",
    },];

    const components = {
        body: {
            row: DragableBodyRow,
        },
    };


    const [archetypes, setArchetypes] = useState(getArchetypesFromStorage());


    function save(archetype) {
        saveArchetypes(archetype);
        setArchetypes(archetype);
    }


    const data = archetypes.map((test, index) => {
        let required;
        if ("requiredString" in test) required = test.requiredString;
        else if ("required" in test) required = test.required.map(escapeCommas).join(", ");
        else required = "";

        let optional;
        if ("optionalString" in test) optional = test.optionalString;
        else if ("optional" in test) optional = test.optional.map(escapeCommas).join(", ");
        else optional = "";

        return {
            key: index,
            name: <Input value={test.name} onChange={(e) => {
                let newArchetypes = [...archetypes];
                newArchetypes[index] = {...test, name: e.target.value};
                save(newArchetypes);
            }}/>,
            required: <Input value={required} onChange={(e) => {
                let newArchetypes = [...archetypes];
                newArchetypes[index] = {
                    ...test,
                    required: stringToList(e.target.value),
                    requiredString: e.target.value
                };
                save(newArchetypes);
            }}/>,
            optional: <Input value={optional} onChange={(e) => {
                let newArchetypes = [...archetypes];
                newArchetypes[index] = {
                    ...test,
                    optional: stringToList(e.target.value),
                    optionalString: e.target.value
                };
                save(newArchetypes);
            }}/>,
            optionalCount: <Input value={test.optionalCount} type="number" maxLength={2} onChange={(e) => {
                let newArchetypes = [...archetypes];
                newArchetypes[index] = {...test, optionalCount: e.target.value};
                save(newArchetypes);
            }}/>,
            delete: <Button icon={<DeleteFilled/>} onClick={(e) => {
                let newArchetypes = [...archetypes];
                newArchetypes.splice(index, 1);
                save(newArchetypes);
            }}/>,
        };
    });

    const moveRow = useCallback(
        (dragIndex, hoverIndex) => {
            let newArchetypes = [...archetypes];
            const dragRow = archetypes[dragIndex];
            newArchetypes.splice(dragIndex, 1);
            newArchetypes.splice(hoverIndex, 0, dragRow);
            save(newArchetypes);
        },
        [archetypes],
    );

    const manager = useRef(RNDContext);

    const [testString, setTestString] = useState("Deflect-o-Bot (25/22 Taunt, Divine Shield, Deathrattle), Glyph Guardian (19/15), Razorgore, the Untamed (33/29), Cobalt Scalebane (20/20), Kalecgos, Arcane Aspect (14/22), Deflect-o-Bot (18/17 Divine Shield), Felfin Navigator (4/4)");


    return <Layout style={{height: "100%"}}>
        <Header/>
        <Layout.Content className="layout" style={{padding: '0 50px'}}>
            <div className="site-layout-content" style={{fontSize: "1.2em"}}>
                <h2>Archetype Rules</h2>
                <div>Customize your rules for how board archetypes are classified in the rest of the dashboard.
                    <ul>
                        <li>Rules are evaluated top-to-bottom</li>
                        <li>Drag and drop to change the order</li>
                        <li>All changes are automatically saved</li>
                    </ul>
                </div>
                <div>
                    <span style={{fontSize: "1em", fontWeight: "600"}}>Test board</span> <TextArea value={testString}
                                                                                                   onChange={(e) => setTestString(e.target.value)}
                                                                                                   autoSize/>
                </div>
                <div style={{margin: "1em 0"}}>
                    <span style={{
                        fontSize: "1em",
                        fontWeight: "600"
                    }}>Evaluated Archetype:</span> {minionsToArchetype(archetypes, testString)}
                </div>
                <DndProvider manager={manager.current.dragDropManager}>
                    <Table columns={columns} dataSource={data} components={components} onRow={(record, index) => ({
                        index,
                        moveRow,
                    })} pagination={false}/>
                </DndProvider>
                <Button style={{marginTop: "1em"}} type="primary" onClick={() => {
                    let newArchetypes = [...archetypes, {}];
                    save(newArchetypes);
                }}>Add Row</Button>
            </div>
        </Layout.Content>
    </Layout>;


}

export default withRouter(ArchetypePage);