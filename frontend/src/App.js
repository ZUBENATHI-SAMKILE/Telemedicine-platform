import React, { useState, useEffect, useRef } from 'react';
import { Video, Phone, PhoneOff, Calendar, User, FileText, CheckCircle, Clock, AlertCircle, History, Edit } from 'lucide-react';
import Chatbot from './Chatbot';

const API_BASE = 'http://localhost:5000/api';

const DOCTORS = [
  {
    id: 101,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@telemed.com',
    specialization: 'Cardiology',
    description: 'Heart conditions, blood pressure, chest pain, cardiovascular diseases',
    experience: '15 years'
  },
  {
    id: 102,
    name: 'Dr. Michael Chen',
    email: 'michael.chen@telemed.com',
    specialization: 'General Surgery',
    description: 'Post-operative care, wound complications, surgical follow-ups',
    experience: '12 years'
  },
  {
    id: 103,
    name: 'Dr. Emily Rodriguez',
    email: 'emily.rodriguez@telemed.com',
    specialization: 'Internal Medicine',
    description: 'Diabetes, infections, general health concerns, chronic diseases',
    experience: '10 years'
  },
  {
    id: 104,
    name: 'Dr. David Thompson',
    email: 'david.thompson@telemed.com',
    specialization: 'Orthopedics',
    description: 'Bone fractures, joint pain, mobility issues, post-surgery rehabilitation',
    experience: '18 years'
  },
  {
    id: 105,
    name: 'Dr. Lisa Patel',
    email: 'lisa.patel@telemed.com',
    specialization: 'Pulmonology',
    description: 'Breathing problems, lung conditions, respiratory infections, COPD',
    experience: '14 years'
  }
];

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [consultations, setConsultations] = useState([]);
  const [activeCall, setActiveCall] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || 'null');
    if (storedUser) {
      setUser(storedUser);
      setView(storedUser.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
      loadConsultations(storedUser);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConsultations = async (currentUser) => {
    try {
      const endpoint = currentUser.role === 'patient' 
        ? `/consultations/patient/${currentUser.id}`
        : `/consultations/doctor/${currentUser.id}`;
      
      const response = await fetch(API_BASE + endpoint);
      const data = await response.json();
      setConsultations(data);
    } catch (error) {
      console.error('Error loading consultations:', error);
      setConsultations([]);
    }
  };

  const LoginForm = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleLogin = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        if (response.ok) {
          setUser(data.user);
          sessionStorage.setItem('user', JSON.stringify(data.user));
          setView(data.user.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
          loadConsultations(data.user);
        } else {
          alert(data.message || 'Invalid email or password');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Unable to connect to server. Please make sure the backend is running on http://localhost:5000');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">TeleMed Care</h1>
            <p className="text-gray-600 mt-2">Early Readmission Prevention</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setView('register')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              New Patient? Register Here
            </button>
          </div>

          <div className="mt-8 pt-6 border-t">
            <p className="text-xs text-gray-500 text-center mb-2">Demo Doctor Login:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <p className="text-center">sarah.johnson@telemed.com / doctor123</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RegisterForm = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
      phone: ''
    });

    const handleRegister = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, role: 'patient' })
        });
        
        const data = await response.json();
        if (response.ok) {
          alert('Registration successful! Please login.');
          setView('login');
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert('Unable to connect to server. Please make sure the backend is running on http://localhost:5000');
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Patient Registration</h1>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Register
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setView('login')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Already have an account? Login
            </button>
          </div>
        </div>
      </div>
    );
  };

  const PatientDashboard = () => {
    const [activeTab, setActiveTab] = useState('doctors');
    const [showBooking, setShowBooking] = useState(false);
    const [selectedDoctor, setSelectedDoctor] = useState(null);
    const [showReschedule, setShowReschedule] = useState(null);
    const [bookingForm, setBookingForm] = useState({
      symptoms: '',
      discharged_from: '',
      discharge_date: '',
      medications: '',
      urgency: 'normal',
      preferred_date: '',
      preferred_time: ''
    });

    const handleBookConsultation = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${API_BASE}/consultations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patient_id: user.id,
            doctor_id: selectedDoctor.id,
            doctor_name: selectedDoctor.name,
            specialization: selectedDoctor.specialization,
            ...bookingForm
          })
        });
        
        if (response.ok) {
          alert('Consultation booked successfully!');
          setShowBooking(false);
          setSelectedDoctor(null);
          loadConsultations(user);
          setBookingForm({
            symptoms: '',
            discharged_from: '',
            discharge_date: '',
            medications: '',
            urgency: 'normal',
            preferred_date: '',
            preferred_time: ''
          });
        } else {
          alert('Failed to book consultation. Please try again.');
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Unable to connect to server. Please try again later.');
      }
    };

    const handleReschedule = async (consultationId) => {
      try {
        const response = await fetch(`${API_BASE}/consultations/${consultationId}/reschedule`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preferred_date: showReschedule.date,
            preferred_time: showReschedule.time
          })
        });
        
        if (response.ok) {
          alert('Consultation rescheduled successfully!');
          loadConsultations(user);
          setShowReschedule(null);
        } else {
          alert('Failed to reschedule. Please try again.');
        }
      } catch (error) {
        console.error('Reschedule error:', error);
        alert('Unable to connect to server. Please try again later.');
      }
    };

    const activeConsultations = consultations.filter(c => c.status !== 'completed' && c.status !== 'cancelled');
    const historyConsultations = consultations.filter(c => c.status === 'completed' || c.status === 'cancelled');

    const startCall = async (consultation) => {
      setActiveCall(consultation);
      setView('video-call');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        alert('Please allow camera and microphone access to start the call.');
      }
    };
    const handleBookFromChatbot = (doctor) => {
    setSelectedDoctor(doctor);
    setShowBooking(true);
    setActiveTab('doctors');
  };


    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">TeleMed Care</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">{user.name}</span>
              <button
                onClick={() => {
                  setUser(null);
                  sessionStorage.removeItem('user');
                  setView('login');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'doctors'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Find Doctors
            </button>
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'consultations'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              My Consultations
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>

          {activeTab === 'doctors' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select a Doctor by Specialization</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DOCTORS.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                        <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                        <p className="text-sm text-gray-500">{doctor.experience} experience</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2"><strong>Expertise:</strong></p>
                      <p className="text-sm text-gray-600">{doctor.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setShowBooking(true);
                      }}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Book Consultation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'consultations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Consultations</h2>
              <div className="grid gap-4">
                {activeConsultations.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No active consultations. Book a consultation with a doctor!</p>
                  </div>
                ) : (
                  activeConsultations.map((consultation) => (
                    <div key={consultation.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{consultation.doctor_name}</h3>
                          <p className="text-blue-600 font-medium mb-2">{consultation.specialization}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              consultation.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {consultation.status === 'pending' && <Clock className="w-4 h-4 inline mr-1" />}
                              {consultation.status === 'accepted' && <CheckCircle className="w-4 h-4 inline mr-1" />}
                              {consultation.status}
                            </span>
                            {consultation.urgency === 'urgent' && (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Booked: {new Date(consultation.created_at).toLocaleDateString()}
                          </p>
                          {consultation.preferred_date && (
                            <p className="text-sm text-gray-700 mt-1">
                              <strong>Scheduled:</strong> {consultation.preferred_date} at {consultation.preferred_time}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {consultation.status === 'accepted' && (
                            <button
                              onClick={() => startCall(consultation)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                            >
                              <Video className="w-4 h-4" />
                              Join Call
                            </button>
                          )}
                          {consultation.status === 'pending' && (
                            <button
                              onClick={() => setShowReschedule({ id: consultation.id, date: '', time: '' })}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition flex items-center gap-2"
                            >
                              <Edit className="w-4 h-4" />
                              Reschedule
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <p className="text-gray-700"><strong>Symptoms:</strong> {consultation.symptoms}</p>
                        <p className="text-gray-700"><strong>Discharged from:</strong> {consultation.discharged_from}</p>
                        {consultation.medications && (
                          <p className="text-gray-700"><strong>Medications:</strong> {consultation.medications}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Consultation History</h2>
              <div className="grid gap-4">
                {historyConsultations.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No consultation history yet.</p>
                  </div>
                ) : (
                  historyConsultations.map((consultation) => (
                    <div key={consultation.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{consultation.doctor_name}</h3>
                          <p className="text-blue-600 font-medium mb-2">{consultation.specialization}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            consultation.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {consultation.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            Date: {new Date(consultation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <p className="text-gray-700"><strong>Symptoms:</strong> {consultation.symptoms}</p>
                        <p className="text-gray-700"><strong>Discharged from:</strong> {consultation.discharged_from}</p>
                        {consultation.notes && (
                          <p className="text-gray-700"><strong>Doctor Notes:</strong> {consultation.notes}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {showBooking && selectedDoctor && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Book Consultation</h3>
                <p className="text-gray-600 mb-4">with {selectedDoctor.name} - {selectedDoctor.specialization}</p>
                <form onSubmit={handleBookConsultation} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms / Concerns</label>
                    <textarea
                      value={bookingForm.symptoms}
                      onChange={(e) => setBookingForm({ ...bookingForm, symptoms: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your symptoms..."
                      required
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discharged From</label>
                      <input
                        type="text"
                        value={bookingForm.discharged_from}
                        onChange={(e) => setBookingForm({ ...bookingForm, discharged_from: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discharge Date</label>
                      <input
                        type="date"
                        value={bookingForm.discharge_date}
                        onChange={(e) => setBookingForm({ ...bookingForm, discharge_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                    <textarea
                      value={bookingForm.medications}
                      onChange={(e) => setBookingForm({ ...bookingForm, medications: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="List medications..."
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={bookingForm.preferred_date}
                        onChange={(e) => setBookingForm({ ...bookingForm, preferred_date: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                      <input
                        type="time"
                        value={bookingForm.preferred_time}
                        onChange={(e) => setBookingForm({ ...bookingForm, preferred_time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Urgency Level</label>
                    <select
                      value={bookingForm.urgency}
                      onChange={(e) => setBookingForm({ ...bookingForm, urgency: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
                    >
                      Book Consultation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBooking(false);
                        setSelectedDoctor(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showReschedule && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Reschedule Consultation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                    <input
                      type="date"
                      value={showReschedule.date}
                      onChange={(e) => setShowReschedule({ ...showReschedule, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                    <input
                      type="time"
                      value={showReschedule.time}
                      onChange={(e) => setShowReschedule({ ...showReschedule, time: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleReschedule(showReschedule.id)}
                      disabled={!showReschedule.date || !showReschedule.time}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-300"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setShowReschedule(null)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Chatbot onBookDoctor={handleBookFromChatbot} />
        </div>
      </div>
    );
  };

  const DoctorDashboard = () => {
    const [activeTab, setActiveTab] = useState('consultations');
    const [selectedConsultation, setSelectedConsultation] = useState(null);

    const handleAcceptConsultation = async (consultationId) => {
      try {
        const response = await fetch(`${API_BASE}/consultations/${consultationId}/accept`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doctor_id: user.id })
        });
        
        if (response.ok) {
          loadConsultations(user);
          alert('Consultation accepted!');
        } else {
          alert('Failed to accept consultation.');
        }
      } catch (error) {
        console.error('Accept error:', error);
        alert('Unable to connect to server. Please try again later.');
      }
    };

    const handleCompleteConsultation = async (consultationId, notes) => {
      try {
        const response = await fetch(`${API_BASE}/consultations/${consultationId}/complete`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes })
        });
        
        if (response.ok) {
          loadConsultations(user);
          alert('Consultation completed!');
        } else {
          alert('Failed to complete consultation.');
        }
      } catch (error) {
        console.error('Complete error:', error);
        alert('Unable to connect to server. Please try again later.');
      }
    };

    const startCall = async (consultation) => {
      setActiveCall(consultation);
      setView('video-call');
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        alert('Please allow camera and microphone access.');
      }
    };

    const activeConsultations = consultations.filter(c => c.status !== 'completed' && c.status !== 'cancelled');
    const historyConsultations = consultations.filter(c => c.status === 'completed' || c.status === 'cancelled');

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-800">TeleMed Care - Doctor Portal</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-gray-800 font-medium">{user.name}</p>
                <p className="text-sm text-blue-600">{user.specialization}</p>
              </div>
              <button
                onClick={() => {
                  setUser(null);
                  sessionStorage.removeItem('user');
                  setView('login');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-4 mb-6 border-b">
            <button
              onClick={() => setActiveTab('consultations')}
              className={`px-4 py-2 font-medium transition ${
                activeTab === 'consultations'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Requests
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium transition flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <History className="w-4 h-4" />
              History
            </button>
          </div>

          {activeTab === 'consultations' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Active Requests</h2>
              <div className="grid gap-4">
                {activeConsultations.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No consultation requests.</p>
                  </div>
                ) : (
                  activeConsultations.map((consultation) => (
                    <div key={consultation.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Patient #{consultation.patient_id}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              consultation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {consultation.status}
                            </span>
                            {consultation.urgency === 'urgent' && (
                              <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-700">
                                <AlertCircle className="w-4 h-4 inline mr-1" />
                                Urgent
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Requested: {new Date(consultation.created_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {consultation.status === 'pending' && (
                            <button
                              onClick={() => handleAcceptConsultation(consultation.id)}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                            >
                              Accept
                            </button>
                          )}
                          {consultation.status === 'accepted' && (
                            <>
                              <button
                                onClick={() => startCall(consultation)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
                              >
                                <Video className="w-4 h-4" />
                                Start Call
                              </button>
                              <button
                                onClick={() => {
                                  const notes = prompt('Enter consultation notes:');
                                  if (notes) handleCompleteConsultation(consultation.id, notes);
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                              >
                                Complete
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => setSelectedConsultation(selectedConsultation?.id === consultation.id ? null : consultation)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
                          >
                            {selectedConsultation?.id === consultation.id ? 'Hide' : 'View'}
                          </button>
                        </div>
                      </div>

                      {selectedConsultation?.id === consultation.id && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Symptoms</h4>
                            <p className="text-gray-700">{consultation.symptoms}</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Discharged From</p>
                              <p className="text-gray-800">{consultation.discharged_from}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Discharge Date</p>
                              <p className="text-gray-800">{consultation.discharge_date}</p>
                            </div>
                          </div>
                          {consultation.medications && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <h4 className="font-semibold text-gray-800 mb-2">Medications</h4>
                              <p className="text-gray-700">{consultation.medications}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">History</h2>
              <div className="grid gap-4">
                {historyConsultations.length === 0 ? (
                  <div className="bg-white rounded-lg p-8 text-center">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No history yet.</p>
                  </div>
                ) : (
                  historyConsultations.map((consultation) => (
                    <div key={consultation.id} className="bg-white rounded-lg p-6 shadow-sm border">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Patient #{consultation.patient_id}</h3>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            {consultation.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            {new Date(consultation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {consultation.notes && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-gray-700"><strong>Notes:</strong> {consultation.notes}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setActiveCall(null);
    setView(user.role === 'patient' ? 'patient-dashboard' : 'doctor-dashboard');
  };

  const VideoCallRoom = () => {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <div className="bg-gray-800 px-4 py-3 flex justify-between items-center">
          <div className="text-white">
            <h2 className="font-semibold">
              {user.role === 'patient' ? activeCall?.doctor_name : `Patient #${activeCall?.patient_id}`}
            </h2>
            <p className="text-sm text-gray-400">Session ID: {activeCall?.id}</p>
          </div>
          <button
            onClick={endCall}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <PhoneOff className="w-5 h-5" />
            End Call
          </button>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              You
            </div>
          </div>

          <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-center">
                <Phone className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
                <p className="text-gray-400">Waiting for participant...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-white font-semibold mb-2">Notes</h3>
            <textarea
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Add notes..."
            ></textarea>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {view === 'login' && <LoginForm />}
      {view === 'register' && <RegisterForm />}
      {view === 'patient-dashboard' && <PatientDashboard />}
      {view === 'doctor-dashboard' && <DoctorDashboard />}
      {view === 'video-call' && <VideoCallRoom />}
    </>
  );
};

export default App;