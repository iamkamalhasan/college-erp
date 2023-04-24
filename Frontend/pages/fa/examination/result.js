import { useEffect, useState } from "react";
import axios from "../../../axios.config";

import Download from "../../../utilities/Download";
import Dropdown from "../../../utilities/Dropdown";
import Upload from "../../../utilities/Upload";
import Search from "../../../utilities/Search";
import Table from "../../../utilities/Table";
import Toast from "../../../utilities/Toast";
import Loading from "../../../utilities/Loading";

const Result = () => {
    let omit = ["_id", "studentId", "courseId"];
    const omitFields = (field) => !omit.some((item) => item == field);

    const [branch, setBranch] = useState("ALL");
    const [batch, setBatch] = useState(null);
    const [filter, setFilter] = useState(null);
    const [fields, setFields] = useState(null);
    const [search, setSearch] = useState("");
    const [isloading, setIsloading] = useState(false);
    const [data, setData] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastDetails, setToastDetails] = useState({ message: "", type: "", duration: "" });

    useEffect(() => {
        setData(null);
        let data = {
            batch: batch,
        };
        console.log(data);
        if (!batch) {
            setToastDetails({ duration: 3000, message: "Please Choose Batch", type: "info" });
            setShowToast(true);
        } else {
            setIsloading(true);
            axios
                .get("/admin/result", { params: data })
                .then((response) => {
                    if (response) {
                        if (response.data.results.length == 0) {
                            console.log("Empty array");
                            if (batch) {
                                setToastDetails({ duration: 30000, message: `Data not exist for batch - ${batch}`, type: "warning" });
                                setShowToast(true);
                            }
                            setIsloading(false);
                        } else {
                            
                            let data = response.data.results,
                                fields = [];
                            fields = Object.keys(data[0]).filter((key) => omitFields(key));
                            setFilter(fields[0]);
                            setFields(fields);
                            setData(data);
                            setIsloading(false);
                            setToastDetails({ duration: 5000, message: `Details fetched for batch - ${batch}`, type: "success" });
                            setShowToast(true);
                        }
                    }
                })
                .catch((err) => {
                    console.log(err);
                    setToastDetails({ duration: 10000, message: `Something wrong happened - Please try again`, type: "error" });
                    setShowToast(true);
                    setIsloading(false);
                    setBatch(null);
                });
        }
    }, [batch]);

    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase());

    const filterCheck = (doc) => (branch == "ALL" ? true : doc.branch == branch) && filterSearch(doc);

    return (
        <>
            <div className="mr-2 flex justify-between">
                <div className="flex space-x-6">
                    <Dropdown name="Batch" update={setBatch} data={[2018, 2019, 2020]} />
                    {data ? <Dropdown name="Branch" update={setBranch} data={["ALL", "IT", "CSE", "Civil", "Mech", "EEE", "EIE", "Prod", "IBT"]} /> : <></>}
                </div>
                {data && 
                <>
                    <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch} />
                    <Download data={data.filter((doc) => filterCheck(doc))}  name={"results_downlad_batch-"+batch} />
                </>}
            </div>
            <br />

            {data ? (
                <>
                    <Table data={data.filter((doc) => filterCheck(doc))} omit={omit} indexed />
                    <br />
                </>
            ) : batch ? (
                isloading ? (
                    <Loading />
                ) : (
                    <>No Data Exists for Batch {batch}</>
                )
            ) : (
                <>Please choose batch</>
            )}
            {showToast && <Toast duration={toastDetails.duration} message={toastDetails.message} type={toastDetails.type} />}
        </>
    );
};

export default Result;
