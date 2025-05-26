import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Warden.css";
import { FaCheck, FaTimes, FaClock, FaCheckCircle, FaTimesCircle, FaSignOutAlt } from "react-icons/fa";
import { notifyRequestStatus } from '../../utils/emailService';

const STORAGE_KEY = "student_outpass_requests";
const INITIAL_REQUESTS = {
  pending: [],
  approved: [],
  rejected: [],
};

const WardenDashboard = () => {
  const [tab, setTab] = useState("pending");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const navigate = useNavigate();

  // Load requests from localStorage on mount
  useEffect(() => {
    const loadRequests = () => {
      const storedRequests = localStorage.getItem(STORAGE_KEY);
      if (storedRequests) {
        setRequests(JSON.parse(storedRequests));
      }
    };

    loadRequests();
    // Add event listener for storage changes
    window.addEventListener('storage', loadRequests);
    return () => window.removeEventListener('storage', loadRequests);
  }, []);

  const handleRequest = async (requestId, action) => {
    if (action === 'reject' && !rejectionReason) {
      setSelectedRequestId(requestId);
      setShowRejectionModal(true);
      return;
    }

    const currentRequests = JSON.parse(localStorage.getItem(STORAGE_KEY) || JSON.stringify(INITIAL_REQUESTS));
    const request = currentRequests.approved.find(req => 
      req.requestId === requestId && 
      req.approvalStatus?.classAdvisor === 'approved' && 
      req.approvalStatus?.hod === 'approved' && 
      req.approvalStatus?.warden === 'pending'
    );
    
    if (!request) return;

    try {
      const updatedRequests = {
        ...currentRequests,
        approved: currentRequests.approved.map(req => {
          if (req.requestId === requestId) {
            return {
              ...req,
              actionTimestamp: new Date().toLocaleString(),
              approvedBy: req.approvedBy + ', Warden',
              approvalStatus: {
                ...req.approvalStatus,
                warden: action === 'approve' ? 'approved' : 'rejected'
              }
            };
          }
          return req;
        }),
        rejected: action === 'reject' 
          ? [...currentRequests.rejected, { 
              ...request, 
              actionTimestamp: new Date().toLocaleString(),
              rejectedBy: 'Warden',
              rejectionReason,
              approvalStatus: {
                ...request.approvalStatus,
                warden: 'rejected'
              }
            }] 
          : currentRequests.rejected,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRequests));
      setRequests(updatedRequests);

      // Send email notification
      await notifyRequestStatus(request, action, 'Warden');

      // Reset rejection reason and close modal
      setRejectionReason('');
      setShowRejectionModal(false);
      setSelectedRequestId(null);
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const handleRejectionSubmit = () => {
    if (selectedRequestId) {
      handleRequest(selectedRequestId, 'reject');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: <span className="status-badge status-pending"><FaClock /> Pending</span>,
      approved: <span className="status-badge status-approved"><FaCheckCircle /> Approved</span>,
      rejected: <span className="status-badge status-rejected"><FaTimesCircle /> Rejected</span>
    };
    return badges[status];
  };

  const renderTable = (data, statusLabel) => (
    <div className="table-container">
      <table className="warden-table">
        <thead>
          <tr>
            <th>Request ID</th>
            <th>Student Name</th>
            <th>Class</th>
            <th>Out Date & Time</th>
            <th>Return Date & Time</th>
            <th>Reason</th>
            <th>Status</th>
            {tab === "pending" && <th>Actions</th>}
            {(tab === "approved" || tab === "rejected") && <th>{statusLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {(() => {
            let filtered = [];
            if (tab === "pending") {
              filtered = requests.approved.filter(req =>
                req.approvalStatus &&
                req.approvalStatus.classAdvisor === 'approved' &&
                req.approvalStatus.hod === 'approved' &&
                req.approvalStatus.warden === 'pending'
              );
            } else if (tab === "approved") {
              filtered = requests.approved.filter(req =>
                req.approvalStatus &&
                req.approvalStatus.warden === 'approved'
              );
            } else if (tab === "rejected") {
              filtered = requests.rejected.filter(req =>
                req.approvalStatus &&
                req.approvalStatus.warden === 'rejected'
              );
            }
            if (filtered.length === 0) {
              return (
                <tr>
                  <td colSpan={tab === "pending" ? 9 : 8} style={{ textAlign: 'center' }}>
                    No {tab} requests found
                  </td>
                </tr>
              );
            }
            return filtered.map((req, idx) => (
              <tr key={idx}>
                <td>{req.requestId}</td>
                <td>{req.studentName}</td>
                <td>{req.studentClass}</td>
                <td>{req.outDate}</td>
                <td>{req.returnDate}</td>
                <td>{req.Reason}</td>
                <td>{getStatusBadge(tab)}</td>
                {tab === "pending" && (
                  <td>
                    <button 
                      className="approve-button"
                      onClick={() => handleRequest(req.requestId, 'approve')}
                    >
                      <FaCheck /> Approve
                    </button>
                    <button 
                      className="reject-button"
                      onClick={() => handleRequest(req.requestId, 'reject')}
                    >
                      <FaTimes /> Reject
                    </button>
                  </td>
                )}
                {(tab === "approved" || tab === "rejected") && (
                  <td>{req.actionTimestamp}</td>
                )}
              </tr>
            ));
          })()}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="warden-dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Warden Dashboard</h2>
          <p>Review and manage student outpass requests</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      <div className="tab-buttons">
        {[
          { id: "pending", icon: <FaClock />, label: "Pending" },
          { id: "approved", icon: <FaCheckCircle />, label: "Approved" },
          { id: "rejected", icon: <FaTimesCircle />, label: "Rejected" }
        ].map(({ id, icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={tab === id ? "active" : ""}
          >
            {icon} {label} Requests
          </button>
        ))}
      </div>

      <div>
        {renderTable(
          requests[tab],
          `${tab.charAt(0).toUpperCase() + tab.slice(1)} On`
        )}
      </div>

      {showRejectionModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowRejectionModal(false)} />
          <div className="rejection-modal">
            <h3>Reject Request</h3>
            <p>Please provide a reason for rejecting this request:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows="4"
            />
            <div className="modal-actions">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setSelectedRequestId(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleRejectionSubmit}
                disabled={!rejectionReason.trim()}
              >
                Submit Rejection
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WardenDashboard;