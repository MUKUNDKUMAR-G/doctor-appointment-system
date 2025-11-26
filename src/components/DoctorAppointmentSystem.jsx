import React, { useState, useEffect } from "react";
import {
  Bell,
  Calendar,
  Clock,
  Home,
  LogOut,
  Menu,
  Search,
  User,
  X,
  Stethoscope,
  Users,
  FileText,
  Settings,
  MessageSquare,
} from "lucide-react";
import "./DoctorAppointmentSystem.css";

const DoctorAppointmentSystem = () => {
  const [activeScreen, setActiveScreen] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    // In a real app, this would be API calls
    setTimeout(() => {
      // Sample data for today's appointments
      const todayApps = [
        {
          id: 1,
          patient: "Mukesh Kumar",
          age: 38,
          gender: "Male",
          time: "10:30 AM",
          status: "confirmed",
          reason: "Routine checkup",
          history: "Hypertension",
        },
        {
          id: 2,
          patient: "Priya Sharma",
          age: 28,
          gender: "Female",
          time: "2:15 PM",
          status: "confirmed",
          reason: "Skin allergy",
          history: "None",
        },
        {
          id: 3,
          patient: "Rahul Gupta",
          age: 45,
          gender: "Male",
          time: "4:00 PM",
          status: "pending",
          reason: "Follow-up",
          history: "Diabetes",
        },
      ];

      // Sample data for upcoming appointments
      const upcomingApps = [
        {
          id: 4,
          patient: "Ananya Patel",
          age: 32,
          gender: "Female",
          date: "Mar 22, 2025",
          time: "11:00 AM",
          status: "confirmed",
          reason: "Initial consultation",
        },
        {
          id: 5,
          patient: "Vikram Singh",
          age: 50,
          gender: "Male",
          date: "Mar 24, 2025",
          time: "3:30 PM",
          status: "confirmed",
          reason: "Annual checkup",
        },
      ];

      // Sample data for past appointments
      const pastApps = [
        {
          id: 6,
          patient: "Neha Reddy",
          age: 29,
          gender: "Female",
          date: "Mar 10, 2025",
          time: "9:00 AM",
          status: "completed",
          reason: "Vaccination",
          diagnosis: "Administered flu vaccine",
          prescription: "No medication needed",
        },
        {
          id: 7,
          patient: "Arjun Mehta",
          age: 42,
          gender: "Male",
          date: "Mar 8, 2025",
          time: "1:30 PM",
          status: "completed",
          reason: "Chest pain",
          diagnosis: "Acid reflux",
          prescription: "Antacids for 2 weeks",
        },
      ];

      // Sample notifications
      const doctorNotifications = [
        {
          id: 1,
          message:
            "New appointment booked by Mukesh Kumar for today at 10:30 AM",
          time: "2 hours ago",
          read: false,
        },
        {
          id: 2,
          message: "Appointment with Priya Sharma confirmed",
          time: "Yesterday",
          read: true,
        },
        {
          id: 3,
          message: "Your profile has been viewed 15 times this week",
          time: "2 days ago",
          read: true,
        },
      ];

      // Sample patients
      const doctorPatients = [
        {
          id: 1,
          name: "Mukesh Kumar",
          age: 38,
          gender: "Male",
          lastVisit: "Mar 20, 2025",
          nextAppointment: "Apr 15, 2025",
          medicalHistory: ["Hypertension"],
        },
        {
          id: 2,
          name: "Priya Sharma",
          age: 28,
          gender: "Female",
          lastVisit: "Mar 20, 2025",
          nextAppointment: "None",
          medicalHistory: ["None"],
        },
        {
          id: 3,
          name: "Rahul Gupta",
          age: 45,
          gender: "Male",
          lastVisit: "Mar 18, 2025",
          nextAppointment: "Mar 25, 2025",
          medicalHistory: ["Diabetes", "High Cholesterol"],
        },
      ];

      setTodayAppointments(todayApps);
      setUpcomingAppointments(upcomingApps);
      setPastAppointments(pastApps);
      setNotifications(doctorNotifications);
      setPatients(doctorPatients);
      setLoading(false);
    }, 1000);
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case "dashboard":
        return (
          <DoctorDashboard
            todayAppointments={todayAppointments}
            upcomingAppointments={upcomingAppointments}
            loading={loading}
          />
        );
      case "appointments":
        return (
          <DoctorAppointments
            todayAppointments={todayAppointments}
            upcomingAppointments={upcomingAppointments}
            pastAppointments={pastAppointments}
          />
        );
      case "patients":
        return <DoctorPatients patients={patients} />;
      case "messages":
        return <DoctorMessages />;
      case "profile":
        return <DoctorProfile />;
      case "settings":
        return <DoctorSettings />;
      default:
        return (
          <DoctorDashboard
            todayAppointments={todayAppointments}
            upcomingAppointments={upcomingAppointments}
            loading={loading}
          />
        );
    }
  };

  const markNotificationAsRead = (id) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(
      notifications.map((notification) => ({ ...notification, read: true }))
    );
  };

  return (
    <div className="doctor-app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <span className="logo">Doctor Portal</span>
        </div>

        <div className="header-right">
          <div className="notification-icon">
            <Bell size={20} />
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="notification-badge">
                {notifications.filter((n) => !n.read).length}
              </span>
            )}
          </div>
          <div className="user-info">
            <div className="user-avatar">DS</div>
            <span className="user-name">Dr. Seth</span>
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
            <span className="logo">Doctor Portal</span>
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
                    setActiveScreen("patients");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Users size={20} />
                  <span>Patients</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveScreen("messages");
                    setMobileMenuOpen(false);
                  }}
                >
                  <MessageSquare size={20} />
                  <span>Messages</span>
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
                <button
                  onClick={() => {
                    setActiveScreen("settings");
                    setMobileMenuOpen(false);
                  }}
                >
                  <Settings size={20} />
                  <span>Settings</span>
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
          <div className="doctor-profile-summary">
            <div className="doctor-avatar">DS</div>
            <div className="doctor-info">
              <h3>Dr. Ashok Seth</h3>
              <p>Cardiologist</p>
              <p>15 years experience</p>
            </div>
          </div>
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
                  className={activeScreen === "appointments" ? "active" : ""}
                  onClick={() => setActiveScreen("appointments")}
                >
                  <Calendar size={20} />
                  <span>Appointments</span>
                </button>
              </li>
              <li>
                <button
                  className={activeScreen === "patients" ? "active" : ""}
                  onClick={() => setActiveScreen("patients")}
                >
                  <Users size={20} />
                  <span>Patients</span>
                </button>
              </li>
              <li>
                <button
                  className={activeScreen === "messages" ? "active" : ""}
                  onClick={() => setActiveScreen("messages")}
                >
                  <MessageSquare size={20} />
                  <span>Messages</span>
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
              <li>
                <button
                  className={activeScreen === "settings" ? "active" : ""}
                  onClick={() => setActiveScreen("settings")}
                >
                  <Settings size={20} />
                  <span>Settings</span>
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

      {/* Notifications dropdown */}
      <div className="notifications-dropdown">
        <div className="notifications-header">
          <h3>Notifications</h3>
          <button onClick={markAllNotificationsAsRead}>Mark all as read</button>
        </div>
        <div className="notifications-list">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${
                  notification.read ? "read" : "unread"
                }`}
                onClick={() => markNotificationAsRead(notification.id)}
              >
                <p>{notification.message}</p>
                <span className="notification-time">{notification.time}</span>
                {!notification.read && <div className="unread-dot"></div>}
              </div>
            ))
          ) : (
            <div className="no-notifications">
              <p>No new notifications</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Doctor Dashboard
const DoctorDashboard = ({
  todayAppointments,
  upcomingAppointments,
  loading,
}) => {
  const stats = [
    { title: "Today's Appointments", value: todayAppointments.length },
    { title: "Upcoming Appointments", value: upcomingAppointments.length },
    { title: "Total Patients", value: "142" },
    { title: "Patient Satisfaction", value: "98%" },
  ];

  return (
    <div className="doctor-dashboard">
      <h1>Doctor Dashboard</h1>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="stats-cards">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <h3>{stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Today's schedule */}
          <div className="todays-schedule">
            <h2>Today's Schedule</h2>
            {todayAppointments.length > 0 ? (
              <div className="appointments-list">
                {todayAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`appointment-card ${appointment.status}`}
                  >
                    <div className="appointment-time">
                      <Clock size={16} />
                      <span>{appointment.time}</span>
                    </div>
                    <div className="appointment-details">
                      <h3>{appointment.patient}</h3>
                      <p>
                        {appointment.age} yrs • {appointment.gender}
                      </p>
                      <p className="reason">{appointment.reason}</p>
                      {appointment.history && (
                        <p className="history">
                          History: {appointment.history}
                        </p>
                      )}
                    </div>
                    <div className="appointment-status">
                      <span className={`status ${appointment.status}`}>
                        {appointment.status}
                      </span>
                      <button className="start-consultation">
                        {appointment.status === "completed"
                          ? "View Details"
                          : "Start Consultation"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-appointments">
                <Calendar size={40} />
                <p>No appointments scheduled for today</p>
              </div>
            )}
          </div>

          {/* Upcoming appointments */}
          <div className="upcoming-appointments">
            <h2>Upcoming Appointments</h2>
            {upcomingAppointments.length > 0 ? (
              <div className="upcoming-list">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="upcoming-card">
                    <div className="upcoming-date">
                      <Calendar size={16} />
                      <span>
                        {appointment.date}, {appointment.time}
                      </span>
                    </div>
                    <div className="upcoming-details">
                      <h3>{appointment.patient}</h3>
                      <p>
                        {appointment.age} yrs • {appointment.gender}
                      </p>
                      <p className="reason">{appointment.reason}</p>
                    </div>
                    <div className="upcoming-actions">
                      <button className="confirm">Confirm</button>
                      <button className="reschedule">Reschedule</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-upcoming">
                <p>No upcoming appointments</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Doctor Appointments
const DoctorAppointments = ({
  todayAppointments,
  upcomingAppointments,
  pastAppointments,
}) => {
  const [activeTab, setActiveTab] = useState("today");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredTodayAppointments = todayAppointments.filter(
    (appointment) =>
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === "all" || appointment.status === selectedStatus)
  );

  const filteredUpcomingAppointments = upcomingAppointments.filter(
    (appointment) =>
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === "all" || appointment.status === selectedStatus)
  );

  const filteredPastAppointments = pastAppointments.filter(
    (appointment) =>
      appointment.patient.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedStatus === "all" || appointment.status === selectedStatus)
  );

  return (
    <div className="doctor-appointments">
      <h1>Appointments</h1>

      {/* Search and filter */}
      <div className="appointments-filter">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} />
        </div>
        <div className="status-filter">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="appointments-tabs">
        <button
          className={activeTab === "today" ? "active" : ""}
          onClick={() => setActiveTab("today")}
        >
          Today
        </button>
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
      </div>

      {/* Appointment lists */}
      {activeTab === "today" && (
        <div className="appointments-list">
          {filteredTodayAppointments.length > 0 ? (
            filteredTodayAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`appointment-card ${appointment.status}`}
              >
                <div className="appointment-header">
                  <div className="patient-info">
                    <h3>{appointment.patient}</h3>
                    <p>
                      {appointment.age} yrs • {appointment.gender}
                    </p>
                  </div>
                  <div className="appointment-time">
                    <Clock size={16} />
                    <span>{appointment.time}</span>
                  </div>
                </div>
                <div className="appointment-details">
                  <p className="reason">Reason: {appointment.reason}</p>
                  {appointment.history && (
                    <p className="history">History: {appointment.history}</p>
                  )}
                </div>
                <div className="appointment-actions">
                  <span className={`status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                  <div className="action-buttons">
                    {appointment.status === "pending" && (
                      <>
                        <button className="confirm">Confirm</button>
                        <button className="decline">Decline</button>
                      </>
                    )}
                    {appointment.status === "confirmed" && (
                      <button className="start-consultation">
                        Start Consultation
                      </button>
                    )}
                    {appointment.status === "completed" && (
                      <button className="view-details">View Details</button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-appointments">
              <Calendar size={40} />
              <p>No appointments found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "upcoming" && (
        <div className="appointments-list">
          {filteredUpcomingAppointments.length > 0 ? (
            filteredUpcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`appointment-card ${appointment.status}`}
              >
                <div className="appointment-header">
                  <div className="patient-info">
                    <h3>{appointment.patient}</h3>
                    <p>
                      {appointment.age} yrs • {appointment.gender}
                    </p>
                  </div>
                  <div className="appointment-time">
                    <Calendar size={16} />
                    <span>
                      {appointment.date}, {appointment.time}
                    </span>
                  </div>
                </div>
                <div className="appointment-details">
                  <p className="reason">Reason: {appointment.reason}</p>
                </div>
                <div className="appointment-actions">
                  <span className={`status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                  <div className="action-buttons">
                    {appointment.status === "pending" && (
                      <>
                        <button className="confirm">Confirm</button>
                        <button className="decline">Decline</button>
                      </>
                    )}
                    {appointment.status === "confirmed" && (
                      <>
                        <button className="reschedule">Reschedule</button>
                        <button className="cancel">Cancel</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-appointments">
              <Calendar size={40} />
              <p>No upcoming appointments found</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "past" && (
        <div className="appointments-list">
          {filteredPastAppointments.length > 0 ? (
            filteredPastAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className={`appointment-card ${appointment.status}`}
              >
                <div className="appointment-header">
                  <div className="patient-info">
                    <h3>{appointment.patient}</h3>
                    <p>
                      {appointment.age} yrs • {appointment.gender}
                    </p>
                  </div>
                  <div className="appointment-time">
                    <Calendar size={16} />
                    <span>
                      {appointment.date}, {appointment.time}
                    </span>
                  </div>
                </div>
                <div className="appointment-details">
                  <p className="reason">Reason: {appointment.reason}</p>
                  {appointment.diagnosis && (
                    <p className="diagnosis">
                      Diagnosis: {appointment.diagnosis}
                    </p>
                  )}
                  {appointment.prescription && (
                    <p className="prescription">
                      Prescription: {appointment.prescription}
                    </p>
                  )}
                </div>
                <div className="appointment-actions">
                  <span className={`status ${appointment.status}`}>
                    {appointment.status}
                  </span>
                  <div className="action-buttons">
                    <button className="view-details">View Details</button>
                    <button className="follow-up">Follow Up</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-appointments">
              <Calendar size={40} />
              <p>No past appointments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Doctor Patients
const DoctorPatients = ({ patients }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="doctor-patients">
      <h1>Patients</h1>

      {/* Search bar */}
      <div className="patients-search">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search size={18} />
        </div>
      </div>

      {/* Patients list */}
      <div className="patients-list">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="patient-card">
              <div className="patient-avatar">
                {patient.name.split(" ")[0][0]}
                {patient.name.split(" ")[1][0]}
              </div>
              <div className="patient-info">
                <h3>{patient.name}</h3>
                <p>
                  {patient.age} yrs • {patient.gender}
                </p>
                <div className="patient-meta">
                  <div>
                    <span>Last Visit:</span>
                    <p>{patient.lastVisit}</p>
                  </div>
                  <div>
                    <span>Next Appointment:</span>
                    <p>
                      {patient.nextAppointment === "None"
                        ? "Not scheduled"
                        : patient.nextAppointment}
                    </p>
                  </div>
                </div>
                <div className="patient-history">
                  <span>Medical History:</span>
                  <div className="history-tags">
                    {patient.medicalHistory.map((item, index) => (
                      <span key={index}>{item}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="patient-actions">
                <button className="view-profile">View Profile</button>
                <button className="message">Message</button>
                <button className="book-appointment">Book Appointment</button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-patients">
            <Users size={40} />
            <p>No patients found</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Doctor Messages
const DoctorMessages = () => {
  const [conversations, setConversations] = useState([
    {
      id: 1,
      patient: "Mukesh Kumar",
      lastMessage: "Thank you doctor for your help!",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      patient: "Priya Sharma",
      lastMessage: "Can I reschedule my appointment?",
      time: "Yesterday",
      unread: false,
    },
    {
      id: 3,
      patient: "Rahul Gupta",
      lastMessage: "I have a question about my prescription",
      time: "3 days ago",
      unread: false,
    },
  ]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageInput, setMessageInput] = useState("");

  const handleSendMessage = () => {
    if (messageInput.trim() && activeConversation) {
      // In a real app, this would send to backend
      const updatedConversations = conversations.map((conv) =>
        conv.id === activeConversation.id
          ? {
              ...conv,
              lastMessage: messageInput,
              time: "Just now",
              unread: false,
            }
          : conv
      );
      setConversations(updatedConversations);
      setMessageInput("");
    }
  };

  return (
    <div className="doctor-messages">
      <h1>Messages</h1>

      <div className="messages-container">
        {/* Conversations list */}
        <div className="conversations-list">
          {conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`conversation-item ${
                  activeConversation?.id === conversation.id ? "active" : ""
                } ${conversation.unread ? "unread" : ""}`}
                onClick={() => setActiveConversation(conversation)}
              >
                <div className="patient-avatar">
                  {conversation.patient.split(" ")[0][0]}
                </div>
                <div className="conversation-info">
                  <h3>{conversation.patient}</h3>
                  <p className="last-message">{conversation.lastMessage}</p>
                  <p className="time">{conversation.time}</p>
                </div>
                {conversation.unread && <div className="unread-dot"></div>}
              </div>
            ))
          ) : (
            <div className="no-conversations">
              <p>No conversations yet</p>
            </div>
          )}
        </div>

        {/* Message area */}
        <div className="message-area">
          {activeConversation ? (
            <>
              <div className="message-header">
                <div className="patient-info">
                  <div className="patient-avatar">
                    {activeConversation.patient.split(" ")[0][0]}
                  </div>
                  <h3>{activeConversation.patient}</h3>
                </div>
                <button className="view-profile">View Profile</button>
              </div>
              <div className="messages">
                <div className="message received">
                  <p>{activeConversation.lastMessage}</p>
                  <span className="time">{activeConversation.time}</span>
                </div>
                <div className="message sent">
                  <p>How can I help you today?</p>
                  <span className="time">Just now</span>
                </div>
              </div>
              <div className="message-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button onClick={handleSendMessage}>Send</button>
              </div>
            </>
          ) : (
            <div className="no-active-conversation">
              <MessageSquare size={40} />
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Doctor Profile
const DoctorProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  const doctor = {
    name: "Dr. Ashok Seth",
    specialty: "Cardiologist",
    email: "draseth@example.com",
    phone: "+91 98765 43210",
    experience: "15 years",
    qualifications: ["MD", "DM (Cardiology)", "FACC"],
    hospital: "Apollo Hospitals, Bangalore",
    address: "154, Bannerghatta Road, Bangalore, Karnataka - 560076",
    consultationFee: "₹2500",
    about:
      "Senior Consultant Cardiologist with extensive experience in interventional cardiology. Specializes in angioplasty, pacemaker implantation, and preventive cardiology.",
    languages: ["English", "Hindi", "Kannada"],
  };

  return (
    <div className="doctor-profile">
      <h1>My Profile</h1>

      {/* Profile summary */}
      <div className="profile-summary">
        <div className="doctor-avatar">AS</div>
        <div className="profile-info">
          <h2>{doctor.name}</h2>
          <p>{doctor.specialty}</p>
          <p>{doctor.hospital}</p>
          <div className="rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={i < 4 ? "filled" : ""}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span>4.9 (128 reviews)</span>
          </div>
        </div>
        <div className="profile-actions">
          <button onClick={() => setEditMode(!editMode)}>
            {editMode ? "Save Changes" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="profile-tabs">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={activeTab === "availability" ? "active" : ""}
          onClick={() => setActiveTab("availability")}
        >
          Availability
        </button>
        <button
          className={activeTab === "reviews" ? "active" : ""}
          onClick={() => setActiveTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {/* Tab content */}
      {activeTab === "profile" && (
        <div className="profile-content">
          <div className="profile-section">
            <h3>Basic Information</h3>
            <div className="info-grid">
              <div>
                <label>Full Name</label>
                {editMode ? (
                  <input type="text" defaultValue={doctor.name} />
                ) : (
                  <p>{doctor.name}</p>
                )}
              </div>
              <div>
                <label>Specialty</label>
                {editMode ? (
                  <input type="text" defaultValue={doctor.specialty} />
                ) : (
                  <p>{doctor.specialty}</p>
                )}
              </div>
              <div>
                <label>Email</label>
                {editMode ? (
                  <input type="email" defaultValue={doctor.email} />
                ) : (
                  <p>{doctor.email}</p>
                )}
              </div>
              <div>
                <label>Phone</label>
                {editMode ? (
                  <input type="tel" defaultValue={doctor.phone} />
                ) : (
                  <p>{doctor.phone}</p>
                )}
              </div>
              <div>
                <label>Years of Experience</label>
                {editMode ? (
                  <input type="text" defaultValue={doctor.experience} />
                ) : (
                  <p>{doctor.experience}</p>
                )}
              </div>
              <div>
                <label>Consultation Fee</label>
                {editMode ? (
                  <input type="text" defaultValue={doctor.consultationFee} />
                ) : (
                  <p>{doctor.consultationFee}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Professional Details</h3>
            <div className="info-grid">
              <div>
                <label>Qualifications</label>
                {editMode ? (
                  <input
                    type="text"
                    defaultValue={doctor.qualifications.join(", ")}
                  />
                ) : (
                  <p>{doctor.qualifications.join(", ")}</p>
                )}
              </div>
              <div>
                <label>Hospital/Clinic</label>
                {editMode ? (
                  <input type="text" defaultValue={doctor.hospital} />
                ) : (
                  <p>{doctor.hospital}</p>
                )}
              </div>
              <div>
                <label>Address</label>
                {editMode ? (
                  <textarea defaultValue={doctor.address} />
                ) : (
                  <p>{doctor.address}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>About</h3>
            {editMode ? (
              <textarea
                className="about-textarea"
                defaultValue={doctor.about}
              />
            ) : (
              <p>{doctor.about}</p>
            )}
          </div>

          <div className="profile-section">
            <h3>Languages Spoken</h3>
            {editMode ? (
              <input type="text" defaultValue={doctor.languages.join(", ")} />
            ) : (
              <div className="language-tags">
                {doctor.languages.map((language, index) => (
                  <span key={index}>{language}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "availability" && (
        <div className="availability-content">
          <h3>Weekly Schedule</h3>
          <div className="availability-calendar">
            {/* Calendar view would go here */}
            <p>Calendar view of weekly availability</p>
          </div>

          <h3>Set Availability</h3>
          <div className="set-availability">
            <div className="day-selector">
              <label>Day</label>
              <select>
                <option>Monday</option>
                <option>Tuesday</option>
                <option>Wednesday</option>
                <option>Thursday</option>
                <option>Friday</option>
                <option>Saturday</option>
                <option>Sunday</option>
              </select>
            </div>
            <div className="time-selector">
              <label>From</label>
              <input type="time" />
              <label>To</label>
              <input type="time" />
            </div>
            <button>Add Slot</button>
          </div>

          <h3>Current Availability</h3>
          <div className="current-availability">
            <div className="availability-slot">
              <span>Monday</span>
              <span>9:00 AM - 5:00 PM</span>
              <button className="remove">Remove</button>
            </div>
            <div className="availability-slot">
              <span>Tuesday</span>
              <span>9:00 AM - 5:00 PM</span>
              <button className="remove">Remove</button>
            </div>
            <div className="availability-slot">
              <span>Wednesday</span>
              <span>9:00 AM - 5:00 PM</span>
              <button className="remove">Remove</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "reviews" && (
        <div className="reviews-content">
          <div className="reviews-summary">
            <div className="average-rating">
              <h2>4.9</h2>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={i < 4 ? "filled" : ""}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p>Based on 128 reviews</p>
            </div>
            <div className="rating-distribution">
              <div className="rating-bar">
                <span>5 stars</span>
                <div className="bar">
                  <div className="fill" style={{ width: "85%" }}></div>
                </div>
                <span>109</span>
              </div>
              <div className="rating-bar">
                <span>4 stars</span>
                <div className="bar">
                  <div className="fill" style={{ width: "10%" }}></div>
                </div>
                <span>13</span>
              </div>
              <div className="rating-bar">
                <span>3 stars</span>
                <div className="bar">
                  <div className="fill" style={{ width: "3%" }}></div>
                </div>
                <span>4</span>
              </div>
              <div className="rating-bar">
                <span>2 stars</span>
                <div className="bar">
                  <div className="fill" style={{ width: "1%" }}></div>
                </div>
                <span>1</span>
              </div>
              <div className="rating-bar">
                <span>1 star</span>
                <div className="bar">
                  <div className="fill" style={{ width: "1%" }}></div>
                </div>
                <span>1</span>
              </div>
            </div>
          </div>

          <div className="reviews-list">
            <div className="review-card">
              <div className="review-header">
                <div className="patient-avatar">MK</div>
                <div>
                  <h3>Mukesh Kumar</h3>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={i < 5 ? "filled" : ""}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <span className="review-time">2 weeks ago</span>
              </div>
              <div className="review-content">
                <p>
                  Dr. Seth is an excellent cardiologist. He took the time to
                  explain everything clearly and made me feel comfortable
                  throughout the procedure. Highly recommended!
                </p>
              </div>
            </div>

            <div className="review-card">
              <div className="review-header">
                <div className="patient-avatar">PS</div>
                <div>
                  <h3>Priya Sharma</h3>
                  <div className="review-rating">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={i < 4 ? "filled" : ""}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <span className="review-time">1 month ago</span>
              </div>
              <div className="review-content">
                <p>
                  Very professional and knowledgeable. The only reason I'm not
                  giving 5 stars is because the wait time was a bit long.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Doctor Settings
const DoctorSettings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  return (
    <div className="doctor-settings">
      <h1>Settings</h1>

      <div className="settings-container">
        {/* Settings sidebar */}
        <div className="settings-sidebar">
          <button
            className={activeTab === "account" ? "active" : ""}
            onClick={() => setActiveTab("account")}
          >
            Account
          </button>
          <button
            className={activeTab === "notifications" ? "active" : ""}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
          <button
            className={activeTab === "privacy" ? "active" : ""}
            onClick={() => setActiveTab("privacy")}
          >
            Privacy
          </button>
          <button
            className={activeTab === "billing" ? "active" : ""}
            onClick={() => setActiveTab("billing")}
          >
            Billing
          </button>
        </div>

        {/* Settings content */}
        <div className="settings-content">
          {activeTab === "account" && (
            <div className="account-settings">
              <h2>Account Settings</h2>
              <div className="settings-form">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue="draseth@example.com" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" defaultValue="+91 98765 43210" />
                </div>
                <div className="form-group">
                  <label>Change Password</label>
                  <input type="password" placeholder="New password" />
                  <input type="password" placeholder="Confirm new password" />
                </div>
                <button className="save-changes">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="notification-settings">
              <h2>Notification Preferences</h2>
              <div className="notification-options">
                <div className="option">
                  <div>
                    <h3>Enable Notifications</h3>
                    <p>Receive app notifications</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={notificationsEnabled}
                      onChange={() =>
                        setNotificationsEnabled(!notificationsEnabled)
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="option">
                  <div>
                    <h3>Email Notifications</h3>
                    <p>Receive important updates via email</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={() =>
                        setEmailNotifications(!emailNotifications)
                      }
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="option">
                  <div>
                    <h3>SMS Notifications</h3>
                    <p>Receive appointment reminders via SMS</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={() => setSmsNotifications(!smsNotifications)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <button className="save-changes">Save Preferences</button>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="privacy-settings">
              <h2>Privacy Settings</h2>
              <div className="privacy-options">
                <div className="option">
                  <div>
                    <h3>Profile Visibility</h3>
                    <p>Make your profile visible to patients</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="option">
                  <div>
                    <h3>Show Reviews</h3>
                    <p>Display patient reviews on your profile</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
                <div className="option">
                  <div>
                    <h3>Data Sharing</h3>
                    <p>Allow anonymous data for research purposes</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
              <div className="data-export">
                <h3>Export Your Data</h3>
                <p>
                  Download a copy of your personal data and appointment history
                </p>
                <button className="export-button">Export Data</button>
              </div>
              <div className="account-deletion">
                <h3>Delete Account</h3>
                <p>
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
                <button className="delete-button">Delete Account</button>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="billing-settings">
              <h2>Billing & Payments</h2>
              <div className="payment-methods">
                <h3>Payment Methods</h3>
                <div className="payment-card">
                  <div className="card-icon">VISA</div>
                  <div className="card-details">
                    <p>Visa ending in 4242</p>
                    <p>Expires 09/26</p>
                  </div>
                  <button className="remove-card">Remove</button>
                </div>
                <button className="add-card">Add Payment Method</button>
              </div>
              <div className="billing-history">
                <h3>Billing History</h3>
                <div className="history-table">
                  <div className="table-header">
                    <span>Date</span>
                    <span>Description</span>
                    <span>Amount</span>
                    <span>Status</span>
                  </div>
                  <div className="table-row">
                    <span>Mar 15, 2025</span>
                    <span>Monthly Subscription</span>
                    <span>₹2,999.00</span>
                    <span className="paid">Paid</span>
                  </div>
                  <div className="table-row">
                    <span>Feb 15, 2025</span>
                    <span>Monthly Subscription</span>
                    <span>₹2,999.00</span>
                    <span className="paid">Paid</span>
                  </div>
                  <div className="table-row">
                    <span>Jan 15, 2025</span>
                    <span>Monthly Subscription</span>
                    <span>₹2,999.00</span>
                    <span className="paid">Paid</span>
                  </div>
                </div>
              </div>
              <div className="subscription">
                <h3>Subscription Plan</h3>
                <div className="plan-card">
                  <div className="plan-details">
                    <h4>Professional Plan</h4>
                    <p>₹2,999/month</p>
                    <ul>
                      <li>Unlimited appointments</li>
                      <li>Patient management</li>
                      <li>Premium profile listing</li>
                      <li>24/7 support</li>
                    </ul>
                  </div>
                  <button className="change-plan">Change Plan</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentSystem;