import React, { useState } from "react";
import {
  Bell,
  Calendar,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import "./HealthcareAppointmentSystem.css";
import "./Dashboard.css";
import "./FindDoctors.css";
import "./AppointmentsList.css";
import "./NotificationsScreen.css";
import "./UserProfile.css";

const HealthcareAppointmentSystem = () => {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sample data
  const upcomingAppointments = [
    {
      id: 1,
      doctor: "Dr. Ashok Seth",
      specialty: "Cardiologist",
      date: "Mar 20, 2025",
      time: "10:30 AM",
      status: "confirmed",
    },
    {
      id: 2,
      doctor: "Dr Arvind Kaul",
      specialty: "Dermatologist",
      date: "Mar 24, 2025",
      time: "2:15 PM",
      status: "confirmed",
    },
  ];

  const doctors = [
    {
      id: 1,
      name: "Dr. Ashok Seth",
      specialty: "Cardiologist",
      rating: 4.9,
      experience: "15 years",
      fee: "₹2500",
    },
    {
      id: 2,
      name: "Dr Arvind Kaul",
      specialty: "Dermatologist",
      rating: 4.8,
      experience: "12 years",
      fee: "₹2000",
    },
    {
      id: 3,
      name: "Dr. Aisha Patel",
      specialty: "Neurologist",
      rating: 4.7,
      experience: "10 years",
      fee: "₹1500",
    },
    {
      id: 4,
      name: "Dr. Dhananjay Malankar",
      specialty: "Pediatrician",
      rating: 4.9,
      experience: "14 years",
      fee: "₹1200",
    },
  ];

  const notifications = [
    {
      id: 1,
      message: "Appointment reminder: Dr. Ashok Seth tomorrow at 10:30 AM",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message: "Your payment of ₹2000 has been processed successfully",
      time: "Yesterday",
      read: true,
    },
    {
      id: 3,
      message: "Dr Arvind Kaul has confirmed your appointment",
      time: "2 days ago",
      read: true,
    },
  ];

  // Render different screens
  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return (
          <Dashboard
            appointments={upcomingAppointments}
            setActiveScreen={setActiveScreen}
          />
        );
      case "find-doctors":
        return <FindDoctors doctors={doctors} />;
      case "appointments":
        return <AppointmentsList appointments={upcomingAppointments} />;
      case "notifications":
        return <NotificationsScreen notifications={notifications} />;
      case "profile":
        return <UserProfile />;
      default:
        return (
          <Dashboard
            appointments={upcomingAppointments}
            setActiveScreen={setActiveScreen}
          />
        );
    }
  };

  return (
    <div className="healthcare-app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="logo">Doctor Management</span>
        </div>

        <div className="header-right">
          <button className="icon-button">
            <Bell size={20} />
          </button>
          <div className="user-info">
            <div className="user-avatar">MH</div>
            <span className="user-name">Mukesh</span>
          </div>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu size={24} />
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <span className="logo">MediBook</span>
            <button onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          </div>
          <nav className="mobile-nav">
            <ul>
              <li>
                <button
                  onClick={() => {
                    setActiveScreen("dashboard");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveScreen("find-doctors");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Search size={20} />
                  <span>Find Doctors</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveScreen("appointments");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Calendar size={20} />
                  <span>Appointments</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveScreen("notifications");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Bell size={20} />
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveScreen("profile");
                    setMobileMenuOpen(false);
                  }}
                >
                  <User size={20} />
                  <span>Profile</span>
                </button>
              </li>
              <li>
                <button>
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Main content */}
      <div className="main-content">
        {/* Sidebar (desktop) */}
        <aside className="sidebar">
          <nav>
            <ul>
              <li>
                <button
                  className={activeScreen === "dashboard" ? "active" : ""}
                  onClick={() => setActiveScreen("dashboard")}
                >
                  <Home size={20} />
                  <span>Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  className={activeScreen === "find-doctors" ? "active" : ""}
                  onClick={() => setActiveScreen("find-doctors")}
                >
                  <Search size={20} />
                  <span>Find Doctors</span>
                </button>
              </li>
              <li>
                <button
                  className={activeScreen === "appointments" ? "active" : ""}
                  onClick={() => setActiveScreen("appointments")}
                >
                  <Calendar size={20} />
                  <span>Appointments</span>
                </button>
              </li>
              <li>
                <button
                  className={activeScreen === "notifications" ? "active" : ""}
                  onClick={() => setActiveScreen("notifications")}
                >
                  <Bell size={20} />
                  <span>Notifications</span>
                </button>
              </li>
              <li>
                <button
                  className={activeScreen === "profile" ? "active" : ""}
                  onClick={() => setActiveScreen("profile")}
                >
                  <User size={20} />
                  <span>Profile</span>
                </button>
              </li>
            </ul>
          </nav>
          <div className="sidebar-footer">
            <button>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className="content-area">{renderScreen()}</main>
      </div>
    </div>
  );
};

// Dashboard screen
const Dashboard = ({ appointments, setActiveScreen }) => {
  return (
    <div className="dashboard">
      <h1>Welcome back, Mukesh!</h1>

      {/* Quick actions */}
      <div className="quick-actions">
        <button
          className="action-button"
          onClick={() => setActiveScreen("find-doctors")}
        >
          <Search size={24} />
          <span>Find Doctor</span>
        </button>
        <button
          className="action-button"
          onClick={() => setActiveScreen("appointments")}
        >
          <Calendar size={24} />
          <span>My Appointments</span>
        </button>
        <button className="action-button">
          <CreditCard size={24} />
          <span>Payment History</span>
        </button>
      </div>

      {/* Upcoming appointments */}
      <div className="upcoming-appointments">
        <div className="section-header">
          <h2>Upcoming Appointments</h2>
          <button onClick={() => setActiveScreen("appointments")}>
            View All
          </button>
        </div>

        {appointments.length > 0 ? (
          <div className="appointments-list">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h3>{appointment.doctor}</h3>
                    <p>{appointment.specialty}</p>
                  </div>
                  <span className="status">{appointment.status}</span>
                </div>
                <div className="appointment-details">
                  <div className="date-time">
                    <Calendar size={16} />
                    <span>
                      {appointment.date}, {appointment.time}
                    </span>
                  </div>
                  <div className="actions">
                    <button className="reschedule">Reschedule</button>
                    <button className="cancel">Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-appointments">
            <Calendar size={40} />
            <p>No upcoming appointments</p>
            <button onClick={() => setActiveScreen("find-doctors")}>
              Book an Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Find Doctors screen
const FindDoctors = ({ doctors }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");

  const specialties = [
    "All",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Orthopedic",
  ];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty =
      selectedSpecialty === "All" || doctor.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="find-doctors">
      <h1>Find Doctors</h1>

      {/* Search and filter */}
      <div className="search-filter">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search doctors by name or specialty"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} />
        </div>
        <div className="specialty-filter">
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            {specialties.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="results">
        <h2>Available Doctors ({filteredDoctors.length})</h2>

        {filteredDoctors.length > 0 ? (
          <div className="doctors-list">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="doctor-card">
                <div className="doctor-info">
                  <div className="doctor-avatar">
                    {doctor.name.split(" ")[1][0]}
                    {doctor.name.split(" ")[0][0]}
                  </div>
                  <div className="doctor-details">
                    <h3>{doctor.name}</h3>
                    <p>{doctor.specialty}</p>
                    <div className="rating-experience">
                      <div className="stars">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={
                              i < Math.floor(doctor.rating) ? "filled" : ""
                            }
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span>
                        {doctor.rating} • {doctor.experience}
                      </span>
                    </div>
                  </div>
                  <div className="doctor-fee">
                    <p>{doctor.fee}</p>
                    <button>Book Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-doctors">
            <Search size={40} />
            <p>No doctors found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Appointments List screen
const AppointmentsList = ({ appointments }) => {
  const [activeTab, setActiveTab] = useState("upcoming");

  const pastAppointments = [
    {
      id: 3,
      doctor: "Dr. Aisha Patel",
      specialty: "Neurologist",
      date: "Mar 10, 2025",
      time: "11:00 AM",
      status: "completed",
    },
    {
      id: 4,
      doctor: "Dr. Dhananjay Malankar",
      specialty: "Pediatrician",
      date: "Feb 28, 2025",
      time: "3:30 PM",
      status: "completed",
    },
  ];

  return (
    <div className="appointments-list-screen">
      <h1>My Appointments</h1>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "upcoming" ? "active" : ""}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming
        </button>
        <button
          className={activeTab === "past" ? "active" : ""}
          onClick={() => setActiveTab("past")}
        >
          Past
        </button>
        <button
          className={activeTab === "cancelled" ? "active" : ""}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled
        </button>
      </div>

      {/* Appointment list */}
      {activeTab === "upcoming" && (
        <div className="appointments-section">
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <div key={appointment.id} className="appointment-card">
                <div className="appointment-header">
                  <div>
                    <h3>{appointment.doctor}</h3>
                    <p>{appointment.specialty}</p>
                  </div>
                  <span className={`status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                </div>
                <div className="appointment-details">
                  <div className="date-time">
                    <Calendar size={16} />
                    <span>
                      {appointment.date}, {appointment.time}
                    </span>
                  </div>
                  <div className="actions">
                    <button className="reschedule">Reschedule</button>
                    <button className="cancel">Cancel</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-appointments">
              <Calendar size={40} />
              <p>No upcoming appointments</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "past" && (
        <div className="appointments-section">
          {pastAppointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-header">
                <div>
                  <h3>{appointment.doctor}</h3>
                  <p>{appointment.specialty}</p>
                </div>
                <span className="status">{appointment.status}</span>
              </div>
              <div className="appointment-details">
                <div className="date-time">
                  <Calendar size={16} />
                  <span>
                    {appointment.date}, {appointment.time}
                  </span>
                </div>
                <div className="actions">
                  <button className="book-again">Book Again</button>
                  <button className="view-details">View Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "cancelled" && (
        <div className="no-appointments">
          <X size={40} />
          <p>No cancelled appointments</p>
        </div>
      )}
    </div>
  );
};

// Notifications Screen
const NotificationsScreen = ({ notifications }) => {
  return (
    <div className="notifications-screen">
      <h1>Notifications</h1>

      <div className="notifications-list">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.read ? "read" : "unread"
              }`}
            >
              <div className="notification-icon">
                <Bell size={18} />
              </div>
              <div className="notification-content">
                <p>{notification.message}</p>
                <p className="time">{notification.time}</p>
              </div>
              {!notification.read && <div className="unread-indicator"></div>}
            </div>
          ))
        ) : (
          <div className="no-notifications">
            <Bell size={40} />
            <p>No notifications</p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="mark-all-read">
          <button>Mark all as read</button>
        </div>
      )}
    </div>
  );
};

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState("personal");

  // Sample user data
  const user = {
    name: "Mukesh",
    email: "Mukesh123@example.com",
    phone: "+91 123-4567-890",
    dob: "1985-04-15",
    gender: "Male",
    address: "123 Main Street, Rajajinagar, Bangalore, Karnataka",
    bloodGroup: "O+",
    allergies: ["Penicillin", "Peanuts"],
    chronicConditions: ["Hypertension"],
    profileCompletion: 85,
  };

  return (
    <div className="user-profile">
      <h1>My Profile</h1>

      {/* Profile summary */}
      <div className="profile-summary">
        <div className="profile-avatar">JD</div>
        <div className="profile-info">
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <p>{user.phone}</p>

          <div className="profile-completion">
            <span>Profile completion</span>
            <span>{user.profileCompletion}%</span>
            <div className="completion-bar">
              <div
                className="completion-progress"
                style={{ width: `${user.profileCompletion}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="edit-profile">
          <button>Edit Profile</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={activeTab === "personal" ? "active" : ""}
          onClick={() => setActiveTab("personal")}
        >
          Personal Info
        </button>
        <button
          className={activeTab === "medical" ? "active" : ""}
          onClick={() => setActiveTab("medical")}
        >
          Medical History
        </button>
        <button
          className={activeTab === "payment" ? "active" : ""}
          onClick={() => setActiveTab("payment")}
        >
          Payment Methods
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "personal" && (
        <div className="personal-info">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div>
              <label>Full Name</label>
              <p>{user.name}</p>
            </div>
            <div>
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div>
              <label>Phone Number</label>
              <p>{user.phone}</p>
            </div>
            <div>
              <label>Date of Birth</label>
              <p>{user.dob}</p>
            </div>
            <div>
              <label>Gender</label>
              <p>{user.gender}</p>
            </div>
            <div>
              <label>Address</label>
              <p>{user.address}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "medical" && (
        <div className="medical-info">
          <h3>Medical Information</h3>
          <div className="info-grid">
            <div>
              <label>Blood Group</label>
              <p>{user.bloodGroup}</p>
            </div>
            <div>
              <label>Allergies</label>
              {user.allergies.length > 0 ? (
                <div className="allergies-list">
                  {user.allergies.map((allergy, index) => (
                    <span key={index}>{allergy}</span>
                  ))}
                </div>
              ) : (
                <p>No allergies recorded</p>
              )}
            </div>
            <div>
              <label>Chronic Conditions</label>
              {user.chronicConditions.length > 0 ? (
                <div className="conditions-list">
                  {user.chronicConditions.map((condition, index) => (
                    <span key={index}>{condition}</span>
                  ))}
                </div>
              ) : (
                <p>No chronic conditions recorded</p>
              )}
            </div>
          </div>
          <button>Update Medical Records</button>
        </div>
      )}

      {activeTab === "payment" && (
        <div className="payment-info">
          <h3>Payment Methods</h3>
          <div className="payment-methods">
            <div className="payment-method">
              <div className="payment-icon">VISA</div>
              <div>
                <p>Visa ending in 4242</p>
                <p>Expires 09/26</p>
              </div>
              <span>Default</span>
            </div>
            <div className="payment-method">
              <div className="payment-icon">MC</div>
              <div>
                <p>Mastercard ending in 5678</p>
                <p>Expires 12/25</p>
              </div>
              <button>Make Default</button>
            </div>
          </div>
          <button>Add New Payment Method</button>
        </div>
      )}
    </div>
  );
};

export default HealthcareAppointmentSystem;
