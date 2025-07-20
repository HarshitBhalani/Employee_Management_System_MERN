import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Record() {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    designation: "",
    salary: "",
  });
  const [isNew, setIsNew] = useState(true);
  const [errors, setErrors] = useState({});
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const id = params.id?.toString() || undefined;
      if(!id) return;
      setIsNew(false);
      const response = await fetch(
        `http://localhost:5050/record/${params.id.toString()}`
      );
      if (!response.ok) {
        const message = `An error has occurred: ${response.statusText}`;
        console.error(message);
        return;
      }
      const record = await response.json();
      if (!record) {
        console.warn(`Record with id ${id} not found`);
        navigate("/");
        return;
      }
      setForm(record);
    }
    fetchData();
    return;
  }, [params.id, navigate]);

  // These methods will update the state properties.
  function updateForm(value) {
    return setForm((prev) => {
      return { ...prev, ...value };
    });
  }

  // This function will handle the submission.
  function validate(form) {
    const newErrors = {};
    if (!form.firstname.trim()) newErrors.firstname = "First name is required.";
    if (!form.lastname.trim()) newErrors.lastname = "Last name is required.";
    if (!form.email.trim()) newErrors.email = "Email is required.";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = "Invalid email format.";
    if (!form.contact.trim()) newErrors.contact = "Contact is required.";
    else if (!/^[0-9]{10}$/.test(form.contact)) newErrors.contact = "Contact must be exactly 10 digits.";
    if (!form.designation.trim()) newErrors.designation = "Designation is required.";
    if (!form.salary.toString().trim()) newErrors.salary = "Salary is required.";
    else if (isNaN(Number(form.salary)) || Number(form.salary) < 0) newErrors.salary = "Salary must be a valid number.";
    else if (!/^\d{1,7}$/.test(form.salary.toString())) newErrors.salary = "Salary must be at most 7 digits.";
    return newErrors;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const validationErrors = validate(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    const person = { ...form };
    try {
      let response;
      if (isNew) {
        response = await fetch("http://localhost:5050/record", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(person),
        });
      } else {
        response = await fetch(`http://localhost:5050/record/${params.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(person),
        });
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('A problem occurred with your fetch operation: ', error);
    } finally {
      setForm({ firstname: "", lastname: "", email: "", contact: "", designation: "", salary: "" });
      setErrors({});
      navigate("/");
    }
  }

  // This following section will display the form that takes the input from the user.
  return (
    <>
      <h3 className="text-2xl font-bold p-4 text-[#1e293b] text-center">Create/Update Employee Record</h3>
      <form
        onSubmit={onSubmit}
        className="max-w-2xl mx-auto bg-[#ffffff] border border-[#e2e8f0] rounded-2xl shadow-lg p-6 md:p-10 flex flex-col gap-6"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstname" className="block text-sm font-semibold text-[#1e293b] mb-1">First Name</label>
            <input type="text" name="firstname" id="firstname" className={`w-full border ${errors.firstname ? 'border-red-400' : 'border-[#e2e8f0]'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]`} placeholder="First Name" value={form.firstname} onChange={(e) => updateForm({ firstname: e.target.value })} />
            {errors.firstname && <p className="text-xs text-red-500 mt-1">{errors.firstname}</p>}
          </div>
          <div>
            <label htmlFor="lastname" className="block text-sm font-semibold text-[#1e293b] mb-1">Last Name</label>
            <input type="text" name="lastname" id="lastname" className={`w-full border ${errors.lastname ? 'border-red-400' : 'border-[#e2e8f0]'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]`} placeholder="Last Name" value={form.lastname} onChange={(e) => updateForm({ lastname: e.target.value })} />
            {errors.lastname && <p className="text-xs text-red-500 mt-1">{errors.lastname}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-[#1e293b] mb-1">Email</label>
            <input type="email" name="email" id="email" className={`w-full border ${errors.email ? 'border-red-400' : 'border-[#e2e8f0]'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]`} placeholder="Email" value={form.email} onChange={(e) => updateForm({ email: e.target.value })} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-semibold text-[#1e293b] mb-1">Contact</label>
            <input type="text" name="contact" id="contact" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} className={`w-full border ${errors.contact ? 'border-red-400' : 'border-[#e2e8f0]'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]`} placeholder="Contact" value={form.contact} onChange={(e) => updateForm({ contact: e.target.value.replace(/[^0-9]/g, '').slice(0,10) })} />
            {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
          </div>
          <div>
            <label htmlFor="designation" className="block text-sm font-semibold text-[#1e293b] mb-1">Designation</label>
            <input type="text" name="designation" id="designation" className={`w-full border ${errors.designation ? 'border-red-400' : 'border-[#e2e8f0]'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]`} placeholder="Designation" value={form.designation} onChange={(e) => updateForm({ designation: e.target.value })} />
            {errors.designation && <p className="text-xs text-red-500 mt-1">{errors.designation}</p>}
          </div>
          <div>
            <label htmlFor="salary" className="block text-sm font-semibold text-[#1e293b] mb-1">Salary</label>
            <input type="number" name="salary" id="salary" className={`w-full border ${errors.salary ? 'border-red-400' : 'border-[#e2e8f0]'} rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]`} placeholder="Salary" value={form.salary} onChange={(e) => updateForm({ salary: e.target.value.replace(/[^0-9]/g, '').slice(0,7) })} maxLength={7} />
            {errors.salary && <p className="text-xs text-red-500 mt-1">{errors.salary}</p>}
          </div>
        </div>
        <button
          type="submit"
          className="mt-6 w-full bg-[#1e40af] hover:bg-[#3b82f6] text-white font-semibold py-2 rounded-lg shadow-md transition-colors"
        >
          Save Employee Record
        </button>
      </form>
    </>
  );
}