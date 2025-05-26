import React from "react";
import { Link } from "react-router-dom";

function RoleSelector({ selectedRole, setSelectedRole }) {
  // eslint-disable-next-line no-unused-vars
  let color = "black";
  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
  };

  return (
    <div className="user-role">
      <h5>Select Your Role</h5>
      {["Student", "Class Advisor", "HOD", "Warden"].map((role) => (
        <label key={role} style={{ marginRight: "10px" }}>
          <input
            type="radio"
            value={role}
            checked={selectedRole === role}
            onChange={handleRoleChange}
          />
          {role}
          
        </label>
      ))}
      
    </div>
  );
}

export default RoleSelector;
