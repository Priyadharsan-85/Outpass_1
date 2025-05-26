import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ClassAdvisorForm() {
  const [teacherId, setTeacherId] = useState("");
  const [classHandled, setClassHandled] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Class Advisor Login");
    console.log("Teacher ID:", teacherId);
    console.log("Class Handled:", classHandled);
    // Add validation logic here
    navigate("/class-advisor-dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Class Advisor Login</h4>
      <label>
        Teacher ID:
        <input
          type="text"
          value={teacherId}
          onChange={(e) => setTeacherId(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Class Handled:
        <input
          type="text"
          value={classHandled}
          onChange={(e) => setClassHandled(e.target.value)}
          required
        />
      </label>
      <br />
      <button className="login-button" type="submit">Login</button>
    </form>
  );
}

export default ClassAdvisorForm;
