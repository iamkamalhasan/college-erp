import { useState, useEffect } from "react";
import axios from "../../../axios.config";
import Dropdown from "../../../utilities/Dropdown";
import Download from "../../../utilities/Download";
import Search from "../../../utilities/Search";
import Table from "../../../utilities/Table";
import Button from "../../../utilities/Button";
import Toast from "../../../utilities/Toast";
import Loading from "../../../utilities/Loading";

const ExamFees = () => {
    let omit = ["_id", "approval", "courseDetails", "courseArray", "semester", "paymentDetails"];
    const omitFields = (field) => !omit.some((item) => item == field);

    const [branch, setBranch] = useState("ALL");
    const [batch, setBatch] = useState(null);
    const [semester, setSemester] = useState(null);
    const [filter, setFilter] = useState(null);
    const [fields, setFields] = useState(null);
    const [search, setSearch] = useState("");
    const [isloading, setIsloading] = useState(false);
    const [data, setData] = useState(null);
    const [getData, setGetData] = useState(false);
    const [feeData, setFeeData] = useState(null);
    const [courseDetails, setCourseDetails] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastDetails, setToastDetails] = useState({ message: "", type: "", duration: "" });

    useEffect(() => {
        setData(null);
        let data = {
            batch: batch,
            semester: semester,
        };
        console.log(data);
        setIsloading(true);
        if (!batch && !semester) {
            setToastDetails({ duration: 3000, message: "Please Choose Batch & Semester", type: "info" });
            setShowToast(true);
        }
        axios
            .get("/admin/examfee", { params: data })
            .then((response) => {
                if (response) {
                    console.log(response.data);
                    if (response.data.success) {
                        if (response.data.data.length == 0) {
                            console.log("Empty array");
                            if (batch && semester) {
                                setToastDetails({ duration: 10000, message: `Data not exist for [ batch - ${batch} , sem - ${semester} ]`, type: "warning" });
                                setShowToast(true);
                            }
                            setIsloading(false);
                        } else {
                            if (response.data.paymentDetails.length > 0) {
                                let checkboxKeys = response.data.paymentDetails[0].paymentDetails;
                                if (checkboxKeys.totalAmount == 0) {
                                    setSelectedItems([]);
                                } else {
                                    let nestedFields = checkboxKeys.courseRegistrationFee;
                                    delete checkboxKeys.courseRegistrationFee;
                                    delete checkboxKeys.totalAmount;
                                    delete nestedFields.total;
                                    checkboxKeys = { ...checkboxKeys, ...nestedFields };
                                    let initailCheckBoxFields = Object.keys(checkboxKeys).filter((key) => checkboxKeys[key] != 0);
                                    setSelectedItems(initailCheckBoxFields);
                                }
                            }
                            let data = response.data.data,
                                fields = [];
                            data.map((doc) => {
                                doc.courseArray = doc["courses"];
                                doc.courses = doc["courses"].join(", ");
                            });
                            fields = Object.keys(data[0]).filter((key) => omitFields(key));
                            if (response.data.feeDetails) setFeeData(response.data.feeDetails);
                            setCourseDetails(response.data.courseDetails);
                            setFilter(fields[0]);
                            setFields(fields);
                            setData(data);
                            setIsloading(false);
                            setToastDetails({ duration: 5000, message: `Details fetched for batch - ${batch} & sem - ${semester}`, type: "success" });
                            setShowToast(true);
                        }
                    }
                }
            })
            .catch((err) => {
                console.log(err);
                setToastDetails({ duration: 10000, message: `Something wrong happened - Please try again`, type: "error" });
                setShowToast(true);
                setIsloading(false);
            });
    }, [batch, semester, getData]);

    const filterSearch = (doc) => doc[filter.charAt(0).toLowerCase() + filter.slice(1)].toString().toLowerCase().includes(search.toString().toLowerCase());

    const filterCheck = (doc) => (branch == "ALL" ? true : doc.branch == branch) && filterSearch(doc);

    const handleItemSelect = (_id) => {
        if (selectedItems.includes(_id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== _id));
        } else {
            setSelectedItems([...selectedItems, _id]);
        }
    };

    const handleSubmit = async () => {
        let updatedData = [];
        for (let doc of data) {
            let courseRegistrationFee = {
                theory: 0,
                practical: 0,
                activity: 0,
                internship: 0,
                total: 0,
            };
            let paymentDetails = {
                applicationForm: 0,
                statementOfMarks: 0,
                consolidateMarkSheet: 0,
                courseCompletionCertificate: 0,
                provisionalCertificate: 0,
                degreeCertificate: 0,
                otherUniversityFee: 0,
                totalAmount: 0,
            };

            for (let courseCode of doc.courseArray) {
                const selectedCourseDetails = courseDetails.find((cd) => cd.courseCode === courseCode);
                if (!selectedCourseDetails) {
                    console.error(`Could not find course details for course code "${courseCode}"`);
                    continue;
                }
                const courseType = selectedCourseDetails.type;
                // if (!paymentDetails.courseRegistrationFee.hasOwnProperty(courseType)) {
                //   // console.error(`Invalid course type "${courseType}" in selected course details`);
                //   continue;
                // }
                if (selectedItems.includes(courseType)) {
                    const courseAmount = feeData[courseType];
                    courseRegistrationFee[courseType] += courseAmount;
                    courseRegistrationFee.total += courseAmount;
                }
            }

            let amount = courseRegistrationFee.total;
            for (let selectedItem of selectedItems) {
                if (selectedItem == "theory" || selectedItem == "practical" || selectedItem == "activity" || selectedItem == "internship") {
                    continue;
                }

                paymentDetails[selectedItem] += feeData[selectedItem];
                amount += feeData[selectedItem];
            }

            paymentDetails.totalAmount = amount;
            paymentDetails = { ...paymentDetails, courseRegistrationFee };
            updatedData.push({ ...doc, amount, paymentDetails });
        }

        setData(updatedData);

        setIsloading(true);
        try {
            setShowToast(false);
            setToastDetails({ duration: 5000, message: `Updating Data!!!`, type: "info" });
            setShowToast(true);
            await axios.post("/admin/examfee/updateamount", { updatedData }).then((res) => {
                console.log(res);

                if (res.data.success) {
                    setGetData(true);
                    setData(updatedData);
                    setShowToast(false);
                    setToastDetails({ duration: 5000, message: `Data Updated!!!`, type: "success" });
                    setShowToast(true);
                    setIsloading(false);
                }
            });
        } catch (error) {
            console.log(error);
            setToastDetails({ duration: 5000, message: `Unable to update data - Please try again!!!`, type: "error" });
            setShowToast(true);
        }
    };

    const Card = ({ items }) => {
        delete items.regulation;
        return (
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 pl-4 p-2">
                <h2 className="text-lg font-medium text-blue-500 mb-4">Generate Fees</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Object.entries(items).map(([key, item]) => (
                        <div key={key} className="border rounded-md p-2 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="relative">
                                {selectedItems.includes(item) && (
                                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                        <svg className="w-6 h-6 text-blue-500 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                                            <path fill="#fff" d="M11 6h-2a1 1 0 100 2h2a1 1 0 100-2zM11 9h-2a1 1 0 100 2h2a1 1 0 100-2z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <label className="text-sm inline-flex items-center">
                                <input type="checkbox" value={key} checked={selectedItems.includes(key)} onChange={() => handleItemSelect(key)} />
                                <span className="ml-2 text-gray-700 break-words">
                                    {key} - {item}
                                </span>
                            </label>
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center mt-3">
                    <Button name="Generate Fees" color="blue" event={() => handleSubmit()} />
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="mr-2 flex justify-between">
                <div className="flex space-x-6">
                    <Dropdown name="Batch" update={setBatch} data={[2018, 2019, 2020]} />
                    <Dropdown name="Semester" update={setSemester} data={[1, 2, 3, 4, 5, 6, 7, 8]} />
                    {data ? (
                        <>
                            <Dropdown name="Branch" update={setBranch} data={["ALL", "IT", "CSE", "Civil", "Mech", "EEE", "EIE", "Prod", "IBT"]} />
                        </>
                    ) : (
                        <></>
                    )}
                </div>
                {data ? <Search options={fields} filter={filter} setFilter={setFilter} search={search} update={setSearch} /> : <></>}
                <div className="flex mt-2 space-x-2">{data ? <Download data={data.filter((doc) => filterCheck(doc))} name={"examFeeData_downlad_" + "batch-" + batch +" _semester-"+semester } /> : <></>}</div>
            </div>
            <br />
            {data ? (
                <>
                    <div className="container mx-auto">
                        <Card items={feeData} />
                        <br />
                    </div>
                    {<Table data={data.filter((doc) => filterCheck(doc))} omit={omit} indexed />}
                </>
            ) : batch && semester ? (
                isloading ? (
                    <Loading />
                ) : (
                    <>
                        No Data Exists for Batch {batch} & Semester - {semester}
                    </>
                )
            ) : (
                <>Please choose batch and semester</>
            )}
            {showToast && <Toast duration={toastDetails.duration} message={toastDetails.message} type={toastDetails.type} />}
        </>
    );
};
export default ExamFees;
