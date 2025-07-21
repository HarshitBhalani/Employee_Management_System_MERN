import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// dotenv and process.env are not available in the browser. Use Vite env or hardcode API URL if needed.

const Record = (props) => (
  <tr className={"border-b transition-colors hover:bg-[#e2e8f0] " + (props.idx % 2 === 0 ? "bg-[#ffffff]" : "bg-[#f1f5f9]") }>
    <td className="p-4 align-middle text-[#1e293b]">{props.record.firstname}</td>
    <td className="p-4 align-middle text-[#1e293b]">{props.record.lastname}</td>
    <td className="p-4 align-middle text-[#1e293b]">{props.record.email}</td>
    <td className="p-4 align-middle text-[#1e293b]">{props.record.contact}</td>
    <td className="p-4 align-middle text-[#1e293b]">{props.record.designation}</td>
    <td className="p-4 align-middle text-[#1e293b]">{props.record.salary}</td>
    <td className="p-4 align-middle">
      <div className="flex gap-2">
        <Link
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 border border-[#1e40af] bg-[#1e40af] hover:bg-[#3b82f6] text-white h-9 rounded-md px-3"
          to={`/edit/${props.record._id}`}
        >
          Edit
        </Link>
        <button
          className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dc2626] focus-visible:ring-offset-2 border border-[#dc2626] bg-[#dc2626] hover:bg-[#ea580c] text-white h-9 rounded-md px-3"
          color="red"
          type="button"
          onClick={() => {
            if (window.confirm("Are you sure you want to delete this record?")) {
              props.deleteRecord(props.record._id);
            }
          }}
        >
          Delete
        </button>
      </div>
    </td>
  </tr>
);

export default function RecordList() {
  const [records, setRecords] = useState([]);

  // Fetch records from the database on mount
  useEffect(() => {
    async function getRecords() {
      try {
        const response = await fetch(`http://localhost:5050/record/`);
        if (!response.ok) {
          const message = `An error occurred: ${response.statusText}`;
          console.error(message);
          setRecords([]);
          return;
        }
        const data = await response.json();
        setRecords(data);
      } catch (error) {
        console.error("Failed to fetch records:", error);
        setRecords([]);
      }
    }
    getRecords();
  }, []);

  // Delete a record and update state
  async function deleteRecord(id) {
    await fetch(`http://localhost:5050/record/${id}`, {
      method: "DELETE",
    });
    setRecords((prev) => prev.filter((el) => el._id !== id));
  }

  return (
    <>
      <h3 className="text-2xl font-bold p-4 text-[#1e40af] text-center">Employee Records</h3>
      <div className="border border-[#e2e8f0] rounded-2xl shadow-lg bg-[#ffffff] mx-2 md:mx-auto max-w-7xl overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e2e8f0] bg-[#f8fafc]">
          <thead className="bg-[#1e40af]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">First Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Last Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Designation</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Salary</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-[#ffffff] divide-y divide-[#e2e8f0]">
            {records.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-[#3b82f6] text-lg">No employee records found.</td>
              </tr>
            ) : (
              records.map((record, idx) => (
                <Record
                  record={record}
                  deleteRecord={deleteRecord}
                  key={record._id}
                  idx={idx}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}