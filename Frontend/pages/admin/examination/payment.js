import { useState, useEffect } from "react";
import axios from "../../../axios.config";
import Dropdown from "../../../utilities/Dropdown";
import Download from "../../../utilities/Download";
import Upload from "../../../utilities/Upload";
import Search from "../../../utilities/Search";
import Table from "../../../utilities/Table";
import Toast from "../../../utilities/Toast";
import Loading from "../../../utilities/Loading";

const ExamFees = () => {
    let omit = ["_id", "paymentDetails"];
    const omitFields = (field) => !omit.some((item) => item == field);

    const [branch, setBranch] = useState("ALL");
    const [batch, setBatch] = useState(null);
    const [filter, setFilter] = useState(null);
    const [fields, setFields] = useState(null);
    const [search, setSearch] = useState("");
    const [isloading, setIsloading] = useState(false);
    const [data, setData] = useState(null);
    const [editedDoc, setEditedDoc] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastDetails, setToastDetails] = useState({ message: "", type: "" });

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
                .get("/admin/examfee/payment", { params: data })
                .then((response) => {
                    if (response) {
                        console.log(response.data);
                        if (response.data.length == 0) {
                            console.log("Empty array");
                            if (batch) {
                                setToastDetails({ duration: 30000, message: `Data not exist for batch - ${batch}`, type: "warning" });
                                setShowToast(true);
                            }
                            setIsloading(false);
                        }
                        let data = response.data.data,
                            fields = [];
                        data.map((doc) => {
                            doc.amount = doc.paymentDetails.totalAmount;
                            doc.date = doc.date ? doc.date.toString().slice(0, 10) : "";
                        });

                        fields = Object.keys(data[0]).filter((key) => omitFields(key));
                        setFilter(fields[0]);
                        setFields(fields);
                        setData(data);
                        setIsloading(false);
                        setToastDetails({ duration: 5000, message: `Details fetched for batch - ${batch}`, type: "success" });
                        setShowToast(true);
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

    useEffect(() => {
        if (JSON.stringify(editedDoc) != "{}")
            for (let idx in data)
                if (data[idx]._id == editedDoc._id) {
                    axios
                        .put("/admin/examfees/payment/update", editedDoc)
                        .then((res) => {
                            if (res.data.success) {
                                setToastDetails({ message: res.data.message, type: "success" });
                                setShowToast(true);
                            } else {
                                setToastDetails({ message: res.data.message, type: "error" });
                                setShowToast(true);
                            }
                            data[idx] = { ...editedDoc };
                            setData([...data]);
                        })
                        .catch((err) => {
                            console.log(err);
                            setToastDetails({ duration: 10000, message: `Something wrong happened - Please try again`, type: "error" });
                            setShowToast(true);
                        });
                }
    }, [editedDoc]);

    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase());

    const filterCheck = (doc) => (branch == "ALL" ? true : doc.branch == branch) && filterSearch(doc);

    return (
        <>
            <div className="mr-2 flex justify-between">
                <div className="flex space-x-6">
                    <Dropdown name="Batch" update={setBatch} data={[2018, 2019, 2020]} />
                    {data ? (
                        <>
                            <Dropdown name="Branch" update={setBranch} data={["ALL", "IT", "CSE", "Civil", "Mech", "EEE", "EIE", "Prod", "IBT"]} />
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                {data ? <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch} /> : <></>}
                <div className="flex mt-2 space-x-2">
                    <div
                        onClick={() => {
                            setToastDetails({ duration: 10000, message: `Upload Might take time (upto 10mins)`, type: "info" });
                            setShowToast(true);
                        }}
                    >
                        <Upload path="/admin/examfee/payment/upload" template={{ register: "Register Number of the student", semester: "Semester of the student", paymentDetails_totalAmount: "total amount that is paid", referenceId: "reference Id for that semester", paymentDetails_applicationForm: "amount for applicationForm", paymentDetails_statementOfMarks: "amount for statementOfMarks", paymentDetails_consolidateMarkSheet: "amount for consolidated marksheet", paymentDetails_courseCompletionCertificate: "amount for courseCompletionCertificate", paymentDetails_provisionalCertificate: "amount for provisionalCertificate", paymentDetails_degreeCertificate: "amount for degreeCertificate", paymentDetails_otherUniversityFee: "amount for otherUniversityFee", paymentDetails_courseRegistrationFee_practical: "amount for courseRegistrationFee_practical courses", paymentDetails_courseRegistrationFee_activity: "amount for activity points", paymentDetails_courseRegistrationFee_internship: "amount for Internship courses", paymentDetails_courseRegistrationFee_total: "amount total for course registration fee details" }} />
                    </div>

                    {data ? <Download data={data.filter((doc) => filterCheck(doc))} name={"examFeePaymentData_download_" + "batch-" + batch} /> : <></>}
                </div>
            </div>
            <br />
            {data ? <>{<Table editable data={data.filter((doc) => filterCheck(doc))} update={setEditedDoc} omit={omit} indexed />}</> : batch ? isloading ? <Loading /> : <>No Data Exists</> : <>Please choose batch</>}
            {showToast && <Toast message={toastDetails.message} type={toastDetails.type} />}
        </>
    );
};
export default ExamFees;
