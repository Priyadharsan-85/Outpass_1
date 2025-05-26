import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function WardenForm() {
  const [wardenId, setWardenId] = useState("");
  const [floor, setFloor] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Warden Login");
    console.log("Warden ID:", wardenId);
    console.log("Floor In Charge:", floor);
    // Add validation logic here
    navigate("/warden-dashboard");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Warden Login</h4>
      <label>
        Warden ID:
        <input
          type="text"
          value={wardenId}
          onChange={(e) => setWardenId(e.target.value)}
          required
        />
      </label>
      <br />
      <label>
        Floor In-Charge:
        <input
          type="text"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
          required
        />
      </label>
      <br />
      <button className="login-button" type="submit">Login</button>
    </form>
  );
}

export default WardenForm;
