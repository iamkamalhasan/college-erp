import { useContext, useEffect, useState } from 'react';
import axios from '../../../axios.config';

import Dropdown from '../../../utilities/Dropdown';
import Search from '../../../utilities/Search';
import Button from '../../../utilities/Button';
import Icon from '../../../utilities/Icon';

import { AppContext } from "../../_app"

const Students = () => {
  
    const { data: context } = useContext(AppContext)

    const { branches, metadata } = context

    let batchList = [...new Set(metadata.map(doc => doc.batch))].sort((a, b) => b - a), branchList = [ "ALL", ...new Set(branches.map(doc => doc.branch)) ]

    let omit = [ '_id', 'lastName', 'firstName', 'isCredentialCreated', 'canRequest', 'hallTicketRelease' ];
    const omitFields = (field) => !omit.some((item) => item == field);

    const [ batch, setBatch ] = useState(batchList.sort((a, b)=>b-a)[0]);
    const [ branch, setBranch ] = useState('ALL');
    const [ active, setActive ] = useState('true');

    const [ filter, setFilter ] = useState(null);
    const [ fields, setFields ] = useState(null);
    const [ search, setSearch ] = useState('');

    const [ data, setData ] = useState(null);
    const [ latest, setLatest ] = useState([]);
    const [ editable, setEditable ] = useState(false)
    const [ save, setSave ] = useState(false)
    const [ refresh, setRefresh ] = useState(false)

    useEffect(() => {
        axios.get('/admin/users/students', { params: { batch } })
            .then((response) => {
                let result = response.data, fields = [];
                if(result.length > 0)
                    fields = Object.keys(result[0]).filter((key) => omitFields(key));
                setFilter(fields[0]);
                setRefresh(false)
                setFields(fields);
                setData([...result]);
            }).catch((err) => console.log(err.message));
  
    }, [batch, refresh]);

    useEffect(() => {

        if(save) {
            setEditable(false)
            axios.put("/admin/users/manage", latest)
                .then((response) => {
                    setSave(false)
                    setRefresh(true)
                }).catch((err) => console.log(err.message));
        }

    }, [ save ])

    const filterSearch = (doc) =>
        doc[filter.charAt(0).toLowerCase() + filter.slice(1)]
            .toString()
            .toLowerCase()
            .includes(search.toString().toLowerCase());

    const filterCheck = (doc) => {
        return doc.batch == batch &&
        (branch == 'ALL' ? true : doc.branch == branch) &&
        doc.isActive.toString() == active &&
        filterSearch(doc);
    }

    return data ? <>
        <div className="mr-2 flex justify-between">
            <div className="flex space-x-6">
                <Dropdown name="Batch" update={setBatch} data={batchList}/>
                <Dropdown name="Branch" update={setBranch} data={branchList}/>
                <Dropdown name="Active" update={setActive} data={[ 'true', 'false' ]} disabled={editable}/>
            </div>
            { data.length > 0 && <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch}/> }
        </div><br/>
        {
        data.length>0 && <CustomTable data={data.filter((doc) => filterCheck(doc))} editable={editable} latest={latest} update={setLatest} omit={omit} active={active} indexed/>
        }<br/>
        { data.filter((doc) => filterCheck(doc)).length > 0 && (editable ? 
        <div className="flex space-x-4">
            <Button name="Save" color="blue" event={() => setSave(true)}/>
            <Button name="Cancel" color="blue" event={() => setEditable(false)} outline/>
        </div> : <Button name="Edit" color="blue" event={() => setEditable(true)}/>) }
    </> : <div>Loading</div>
}

const CustomTable = ({ data, latest, update, editable,  omit = ['_id'], active, indexed }) => {
    let count = 0;
    const omitFields = (field) => !omit.some((item) => item == field);

    let temp = {}
    for(let datum of data)
        temp[datum._id] = datum.isActive

    const [ allChecked, setAllChecked ] = useState(true)
    const [ checked, setChecked ] = useState({...temp})

    data.forEach( doc => {
        if(checked[doc._id]) count++;
    } )

    useEffect(()=>{
        setChecked({...temp})
    }, [active])

    useEffect(()=>{ 
            setAllChecked(data.length==count)
    }, [data])

    const manageLatest = (obj, value, all = false) => {

        if(all) {
            if(value || latest.length==0)
                update(data.map(doc => ({ _id: doc._id, isActive: value, email: doc.email, userType: "Student" })))
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
        update(latest.filter(doc => {doc._id != obj._id}))
        if(length==latest.length)
            update([...latest, { _id: obj._id, isActive: value, email: obj.email, userType: "Student" }])

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


export default Students;
