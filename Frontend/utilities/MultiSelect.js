import { useEffect, useState } from "react"
import Select from "react-select"

/**
 * MultiSelect UI Component
 * @param name @type String - Name of multi-select field 
 * @param data @type [String | Integer] - Any selectable collection
 * @param selectedData @type Function - React `setState` method signature
 */
const MultiSelect = ({ name, data, selectedData, values, def}) => {

    const options = data.map(val => ({ value: val, label: val }))
    
    const [selectData, setSelectedData] = useState([])

    useEffect(() => {
        if(values)
{        const defOptions = values.map(val => ({ value: val, label: val}))
        setSelectedData(defOptions)}
    }, [values])


    const handleChange = (val) => {
        setSelectedData(val)
        selectedData(val)
    }

    return ( 
        <div className="group">
            <div className='flex items-center justify-start pl-2'>
                <div className='-mb-2.5 z-10'>
                    <span className='bg-white text-gray-400 group-focus-within:font-bold group-focus-within:text-blue-500 text-sm px-1'>{name}</span>
                </div>
            </div>
            {
                def ? 
                <Select styles={{
                    control: (base) => ({
                        ...base,
                        minHeight: '35px',
                        height: '35px',
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        overflowX: "unset",
                        flexWrap: 'unset',
                        height: '20px',
                    }),
                    multiValue: (base) => ({
                        ...base,
                        flex: '0 0 auto',
                    })
                    }} 
                    id="long-value-select"
                    instanceId="long-value-select"
                    className="w-9/12 text-sm" 
                    maxMenuHeight={250} 
                    key={JSON.stringify(values)} 
                    options={options} 
                    onChange={handleChange}
                    
                    defaultValue={selectData}
                    // value={selectData}
                    isMulti 
                    placeholder="Please enter a tag" 
                /> : 
                <Select styles={{
                    control: (base) => ({
                        ...base,
                        minHeight: '35px',
                        height: '35px',
                    }),
                    valueContainer: (base) => ({
                        ...base,
                        overflowX: "unset",
                        flexWrap: 'unset',
                        height: '20px',
                    }),
                    multiValue: (base) => ({
                        ...base,
                        flex: '0 0 auto',
                    })
                    }} 
                    id="long-value-select"
                    instanceId="long-value-select"
                    className="w-9/12 text-sm" 
                    maxMenuHeight={250} 
                    key={JSON.stringify(values)} 
                    options={options} 
                    onChange={handleChange}
                    
                    // defaultValue={selectData}
                    value={selectData}
                    isMulti 
                    placeholder="Please enter a tag" 
                />
            }

        </div>
    );
}
 
export default MultiSelect;