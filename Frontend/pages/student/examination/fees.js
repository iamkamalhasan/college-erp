import React, { useEffect, useState } from 'react';
import Toast from '../../../utilities/Toast';
import axios from '../../../axios.config';
import Loading from '../../../utilities/Loading';



const Fees = () => {
    const [showToast, setShowToast] = useState(false);
  const [restricted, setRestricted] = useState(false);
  const [restrictedModal, setRestrictedModal] = useState(true);
  const [loading, setLoading] = useState(true);
  const [toastDetails, setToastDetails] = useState({ message: "", type: "" });
  const [paymentDate, setPaymentDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
    useEffect(() => {
    axios
      .get("/student/examfee/payment")
      .then((response) => {
        let data = response.data;
                console.log(response.data);
        if (data.restrict) {
          setRestricted(true);
          setLoading(false)
          setToastDetails({
            message: "Not allowed to enter payment details",
            type: "info",
          });
          setShowToast(true);
        } else {
          setRestricted(false);
          setLoading(false)
          if (data.data) {
            if(data.data.date){
              let date = data.data.date;
              const formattedDate = date.toString().slice(0, 10);
              setPaymentDate(formattedDate);
            }
            setReferenceNumber(data.data.referenceId);
            setToastDetails({
              message: "Payment Details already exists",
              type: "info",
            });
            setShowToast(true);
          } else {
            setToastDetails({
              message: "Enter Payment Details",
              type: "info",
            });
            setShowToast(true);
                }
        }
      })
      .catch((err) => console.log(err.message));
  }, []);

  const handleSubmit = () => {
    axios
      .post("/student/examfee/payment/save", {
        paymentDate,
        referenceNumber,
      })
      .then((response) => {
                console.log(response.data);
        if (!response.data.success) {
          setToastDetails({ message: response.data.message, type: "error" });
          setShowToast(true);
        } else {
          setToastDetails({ message: response.data.message, type: "success" });
          setShowToast(true);
                }
      })
      .catch((err) => console.log(err.message));
  };
 

  return (
    <>
      {restricted ? (
        <>
          {restrictedModal ? (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Modal backdrop */}
                <div
                  className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                  aria-hidden="true"
                ></div>

                {/* Modal content */}
                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Payment details page not opened
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          The exam fees payment page is currently not available
                          for students. Please check back later, as this process
                          may be available later.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      onClick={() => setRestrictedModal(false)}
                      type="button"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="fixed z-10 inset-0 flex items-center justify-center">
                <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment details page not opened
                  </h2>

                  <p className="text-gray-700 mt-3">
                    The exam fees payment page is currently not available for
                    students. Please check back later, as this process may be
                    available later.
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        !loading ?
        <form onSubmit={() =>
          paymentDate && referenceNumber
            ? handleSubmit()
            : () => {
                setToastDetails({
                  message: "Some Fields are empty",
                  type: "error",
                });
                setShowToast(true);
                alert('Please fill out all fields...')
              }} className="container mx-auto m-10 transition duration-500 ease-in-out transform hover:-translate-y-1 hover:border-blue-300">
          <div className="bg-white shadow-lg rounded-md px-8 py-6 pb-8 mb-4">
        <h2 className="text-lg font-medium text-blue-500 mb-4">
          Payment Details
        </h2>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4">
        <div className="mb-4 p-2 transition duration-300 ease-in-out transform hover:-translate-y-1">
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="payment-date"
                >
            Date of Payment
          </label>
                <p className="text-gray-700 text-sm m-3">
                Please enter the date on which you made the payment. This should be the date that appears on your payment receipt or confirmation email. Please ensure that the date is entered in the correct format (e.g. dd/mm/yyyy).
                </p>
          <input
                  className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="payment-date"
            type="date"
            value={paymentDate}
            onChange={(event) => setPaymentDate(event.target.value)}
            required
          />
        </div>
        <div className="mb-6 p-2 transition duration-300 ease-in-out transform hover:-translate-y-1 ">
                <label
                  className="block text-gray-700 font-bold mb-2"
                  htmlFor="reference-number"
                >
            Reference Number
          </label>
                <p className="text-gray-700 text-sm m-3">
                Please enter the reference number associated with your payment. Please ensure that the reference number is entered correctly, as an incorrect reference number may result in your payment not being processed.
                </p>
          <input
                  className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="reference-number"
            type="text"
            placeholder="Enter reference number"
            value={referenceNumber}
            onChange={(event) => setReferenceNumber(event.target.value)}
            required
            />
        </div>
      </div>
        <div className="flex justify-center items-center mt-3">
              {/* <Button
                name="Submit Payment Details"
                color="blue"
                event={() =>
                  paymentDate && referenceNumber
                    ? handleSubmit()
                    : () => {
                        setToastDetails({
                          message: "Some Fields are empty",
                          type: "error",
                        });
                        setShowToast(true);
                        alert('Please fill out all fields...')
                      }
                }
              /> */}
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            Submit Payment Details
          </button>
            </div>
    </div>
        </form>
        : <Loading />
      )}
      {showToast && (
        <Toast message={toastDetails.message} type={toastDetails.type} />
      )}
            </>
  );
};

export default Fees;
