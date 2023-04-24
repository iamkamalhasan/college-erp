import { useEffect, useState } from 'react';
import axios from '../../../axios.config';

import Dropdown from '../../../utilities/Dropdown';
import Search from '../../../utilities/Search';
import Button from '../../../utilities/Button';
import Icon from '../../../utilities/Icon';

const Admin = () => {
  
    let omit = [ '_id', 'isCredentialCreated' ];
    const omitFields = (field) => !omit.some((item) => item == field);

    const [ active, setActive ] = useState('true');

    const [ filter, setFilter ] = useState(null);
    const [ fields, setFields ] = useState(null);
    const [ search, setSearch ] = useState('');

    const [ data, setData ] = useState(null);
    const [ latest, setLatest ] = useState([]);
    const [ editable, setEditable ] = useState(false)
    const [ save, setSave ] = useState(false)

    useEffect(() => {
        
        axios.get('/admin/')
            .then((response) => {
                let result = response.data, fields = [];
                if(result.length > 0)
                    fields = Object.keys(result[0]).filter((key) => omitFields(key));
                setFilter(fields[0]);
                setFields(fields);
                setData([...result]);
            }).catch((err) => console.log(err.message));
  
    }, []);

    useEffect(() => {

        if(save) {
            setEditable(false)
            axios.put("/admin/users/manage", latest)
                .then((response) => {
                    setSave(false)
                }).catch((err) => console.log(err.message));
        }

    }, [ save ])

    const filterSearch = (doc) =>
        doc[filter.charAt(0).toLowerCase() + filter.slice(1)]
            .toString()
            .toLowerCase()
            .includes(search.toString().toLowerCase());

    const filterCheck = (doc) => {
        return doc.isActive.toString() == active &&
        filterSearch(doc);
    }

    return data ? <>
        <div className="mr-2 flex justify-between">
            <div className="flex space-x-6">
                <Dropdown name="Active" update={setActive} data={[ 'true', 'false' ]} disabled={editable}/>
            </div>
            { data.length > 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/> }
        </div><br/>
        <CustomTable data={data.filter((doc) => filterCheck(doc))} editable={editable} latest={latest} update={setLatest} omit={omit}  indexed/><br/>
        { data.filter((doc) => filterCheck(doc)).length > 0 && (editable ? 
        <div className="flex space-x-4">
            <Button name="Save" color="blue" event={() => setSave(true)}/>
            <Button name="Cancel" color="blue" event={() => setEditable(false)} outline/>
        </div> : 
        data.length>1 && <Button name="Edit" color="blue" event={() => setEditable(true)}/>
        ) }
    </> : <div>Loading</div>
}

const CustomTable = ({ data, latest, update, editable,  omit = ['_id'], indexed }) => {

    let count = 0;
    const omitFields = (field) => !omit.some((item) => item == field);

    let temp = {}
    for(let datum of data){
        temp[datum._id] = datum.isActive
    }

    const [ allChecked, setAllChecked ] = useState(true)
    let [ checked, setChecked ] = useState(temp)

    data.forEach( doc => {
        if(checked[doc._id]) count++;
    } )

    useEffect(()=>{
            setAllChecked(data.length==count)
        },[data])

    const manageLatest = (obj, value, all = false) => {

        if(all) {
            if(value|| latest.length==0)
                update(data.map(doc => ({ _id: doc._id, isActive: value, email: doc.email, userType: "Admin" })))
            else update([])

            let temp = {}
            for(let datum of data)
                temp[datum._id] = value
            
            setChecked(temp)
            setAllChecked(value)
            return
        }

        count += value ? 1 : -1

        if(data.length == count) setAllChecked(true)
        else if(allChecked) setAllChecked(false)

        let length = latest.length
        update(latest.filter(doc => doc._id != obj._id))

        if(length==latest.length) update([...latest, { _id: obj._id, isActive: value, email: obj.email, userType: "Admin" }])

    }

    const fields =
        data && data.length > 0
            ? Object.keys(data[0]).filter((key) => omitFields(key))
            : [];

    return ( data &&
        (data.length > 0 ? (
        <div className="max-w-min max-h-[80%] overflow-auto overscroll-none mr-2 rounded-b-lg shadow-md align-middle border rounded-t-lg">
            <table className="table-auto divide-y divide-gray-200 text-sm text-left">
                <thead className="bg-gray-100 text-xs uppercase">
                    <tr>
                    {
                        indexed &&
                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold first:rounded-tl-lg uppercase">sno</th>
                    }
                    {
                        fields.map((heading, index) =>
                        editable && heading == 'isActive' ? 
                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase flex" key={index}>
                            <span className="flex mr-2">ISACTIVE</span>
                            <input type="checkbox" className="group-hover:bg-sky-50 outline-none flex" checked={allChecked} onChange={e => {manageLatest(null, e.target.checked, true)}}/>
                        </th> :
                        <th className="px-5 py-3 text-gray-600 text-left text-xs font-semibold uppercase" key={index}>
                            { heading }
                        </th>)
                    }
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {
                    data.map((row, ridx) => (
                    <tr className={`px-6 py-4 text-sm font-medium text-gray-800 whitespace-nowrap group hover:bg-sky-50`} key={ridx}>
                    {
                        indexed && (
                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap">
                        {ridx + 1}
                        </td>)
                    }
                    {
                        fields.map((key, kidx) => editable && key === 'isActive' ? (
                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap flex justify-center align-middle" key={kidx}>
                            <input type="checkbox" className={`group-hover:bg-sky-50 outline-none`} checked={checked[row._id]} onChange={(e) => { checked[row._id] = e.target.checked; setChecked({...checked}); manageLatest(data[ridx], e.target.checked)}}/>
                        </td> ) : (
                        <td className="px-6 py-4 text-sm text-gray-800 whitespace-nowrap" key={kidx}>
                        {   
                            key == 'isActive' ? (row[key] ? <Icon name="check"/> : <Icon name="check_indeterminate_small"/>) : row[key]
                        }
                        </td>))
                    }
                    </tr>))
                }
                </tbody>
            </table>
        </div> ) : ( <div>No Data Here...</div>)))
}

export default Admin;
