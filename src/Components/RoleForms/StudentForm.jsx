import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentForm() {
  const [name, setName] = useState("");
  const [dept, setDept] = useState("");
  const [dob, setDob] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem('studentName', name);
    localStorage.setItem('studentDept', dept);
    navigate("/student-dashboard");
  };

  return (
    <div>
      <h4>Student Login</h4>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label><br />
        <label>
          Department:
          <input type="text" value={dept} onChange={(e) => setDept(e.target.value)} required />
        </label><br />
        <label>
          Date of Birth:
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
        </label><br />
        <button className="login-button" type="submit">Login</button>
      </form>
    </div>
  );
}

export default StudentForm;
