import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

// Symptom to specialization mapping
const SYMPTOM_MAPPING = {
  // Cardiology
  'chest pain': 'Cardiology',
  'heart': 'Cardiology',
  'palpitations': 'Cardiology',
  'blood pressure': 'Cardiology',
  'shortness of breath': 'Cardiology',
  'irregular heartbeat': 'Cardiology',
  
  // General Surgery
  'wound': 'General Surgery',
  'surgery': 'General Surgery',
  'post-operative': 'General Surgery',
  'surgical': 'General Surgery',
  'infection': 'General Surgery',
  'abscess': 'General Surgery',
  
  // Internal Medicine
  'diabetes': 'Internal Medicine',
  'fever': 'Internal Medicine',
  'fatigue': 'Internal Medicine',
  'weight loss': 'Internal Medicine',
  'nausea': 'Internal Medicine',
  'vomiting': 'Internal Medicine',
  'diarrhea': 'Internal Medicine',
  
  // Orthopedics
  'bone': 'Orthopedics',
  'fracture': 'Orthopedics',
  'joint pain': 'Orthopedics',
  'back pain': 'Orthopedics',
  'knee pain': 'Orthopedics',
  'hip pain': 'Orthopedics',
  'arthritis': 'Orthopedics',
  
  // Pulmonology
  'breathing': 'Pulmonology',
  'cough': 'Pulmonology',
  'asthma': 'Pulmonology',
  'wheezing': 'Pulmonology',
  'lung': 'Pulmonology',
  'copd': 'Pulmonology',
  'respiratory': 'Pulmonology'
};

const DOCTORS = [
  {
    id: 101,
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology'
  },
  {
    id: 102,
    name: 'Dr. Michael Chen',
    specialization: 'General Surgery'
  },
  {
    id: 103,
    name: 'Dr. Emily Rodriguez',
    specialization: 'Internal Medicine'
  },
  {
    id: 104,
    name: 'Dr. David Thompson',
    specialization: 'Orthopedics'
  },
  {
    id: 105,
    name: 'Dr. Lisa Patel',
    specialization: 'Pulmonology'
  }
];

const Chatbot = ({ onBookDoctor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hi! 👋 I\'m your medical assistant. Tell me about your symptoms, and I\'ll recommend the right doctor for you.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Analyze symptoms and find matching specialization
  const analyzeSymptoms = (text) => {
    const lowerText = text.toLowerCase();
    const matches = {};

    // Count matches for each specialization
    Object.entries(SYMPTOM_MAPPING).forEach(([symptom, specialization]) => {
      if (lowerText.includes(symptom)) {
        matches[specialization] = (matches[specialization] || 0) + 1;
      }
    });

    // Find the specialization with most matches
    if (Object.keys(matches).length > 0) {
      return Object.entries(matches).sort((a, b) => b[1] - a[1])[0][0];
    }

    return null;
  };

  // Get doctor by specialization
  const getDoctorBySpecialization = (specialization) => {
    return DOCTORS.find(doc => doc.specialization === specialization);
  };

  // Handle user message
  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const specialization = analyzeSymptoms(input);

      if (specialization) {
        const doctor = getDoctorBySpecialization(specialization);
        
        const botMessage = {
          type: 'bot',
          text: `Based on your symptoms, I recommend consulting with a ${specialization} specialist. ${doctor ? `Dr. ${doctor.name.split(' ')[1]} is available.` : ''} Would you like to book an appointment?`,
          timestamp: new Date(),
          specialization: specialization,
          doctor: doctor
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const botMessage = {
          type: 'bot',
          text: 'I understand you\'re not feeling well. Could you provide more details about your symptoms? For example, are you experiencing pain, fever, breathing difficulties, or other specific issues?',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
      setIsTyping(false);
    }, 1000);
  };

  // Handle quick action buttons
  const handleBookDoctor = (doctor) => {
    const botMessage = {
      type: 'bot',
      text: `Great! I'll help you book an appointment with ${doctor.name}. Redirecting you to the booking page...`,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);
    
    setTimeout(() => {
      setIsOpen(false);
      onBookDoctor(doctor);
    }, 1500);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110 z-50"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Medical Assistant</h3>
                <p className="text-xs text-blue-100">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-blue-700 p-1 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div key={index}>
                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white text-gray-800 rounded-bl-none shadow'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {message.type === 'bot' && message.doctor && (
                  <div className="flex justify-start mt-2">
                    <button
                      onClick={() => handleBookDoctor(message.doctor)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      Book with {message.doctor.name}
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none shadow">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Describe your symptoms..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by TeleMed Care
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;