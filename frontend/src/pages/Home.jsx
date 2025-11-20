import { HiOutlineLightningBolt, HiOutlineChartBar, HiOutlineCog, HiOutlineUsers, 
         HiOutlineShieldCheck, HiOutlineDatabase, HiOutlineBell, HiOutlineChartPie,
         HiOutlineArrowRight } from 'react-icons/hi';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        {/* Hero */}
        <section className="text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white shadow-sm text-gray-700 mb-6 border border-gray-100 hover:shadow-md transition-all duration-300">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Version 1.0 is here - Try our new AI features
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            <span className="relative">
              <span className="absolute -left-8 top-1/2 w-6 h-1 bg-gray-300 transform -translate-y-1/2"></span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-600">
                Smart Industry
              </span>
              <span className="absolute -right-8 top-1/2 w-6 h-1 bg-gray-300 transform -translate-y-1/2"></span>
            </span>
            <br />
            <span className="relative">
              <span className="absolute -left-8 top-1/2 w-6 h-1 bg-gray-300 transform -translate-y-1/2"></span>
              Management System
              <span className="absolute -right-8 top-1/2 w-6 h-1 bg-gray-300 transform -translate-y-1/2"></span>
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your operations with AI-powered insights, real-time monitoring, 
            and seamless workflow automation.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/dashboard"
              className="relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white transition-all duration-300 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-200 hover:-translate-y-1 group"
            >
              Get Started
              <HiOutlineArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
              <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/20 transition-all duration-300"></span>
            </a>
            <a
              href="#features"
              className="relative inline-flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-medium transition-all duration-300 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm hover:shadow-md group"
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Explore Features
              <span className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gray-200 transition-all duration-300"></span>
            </a>
          </div>
        </section>

        {/* Interactive Dashboard Preview */}
        <div className="mt-16 flex justify-center">
          <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition-all duration-300">
            {/* Dashboard Header */}
            <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-b border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">Interactive Dashboard Preview</h3>
                  <p className="text-gray-600 text-sm">Real-time industrial monitoring</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-600 text-sm font-medium">Live</span>
                </div>
              </div>
            </div>

            {/* Dashboard Content */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
              {/* Key Metrics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Production", value: "94.2%", color: "text-green-600", bg: "bg-green-50", icon: "📈" },
                  { label: "Efficiency", value: "87.5%", color: "text-blue-600", bg: "bg-blue-50", icon: "⚡" },
                  { label: "Quality", value: "99.1%", color: "text-purple-600", bg: "bg-purple-50", icon: "✅" },
                  { label: "Safety", value: "100%", color: "text-emerald-600", bg: "bg-emerald-50", icon: "🛡️" }
                ].map((metric, index) => (
                  <div key={index} className={`${metric.bg} rounded-xl p-4 border border-gray-100 hover:shadow-sm transition-all duration-300`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{metric.icon}</span>
                      <div className={`w-2 h-2 ${metric.color.replace('text-', 'bg-')} rounded-full animate-pulse`}></div>
                    </div>
                    <div className={`text-2xl font-bold ${metric.color} mb-1`}>{metric.value}</div>
                    <div className="text-gray-600 text-sm font-medium">{metric.label}</div>
                  </div>
                ))}
              </div>

              {/* Gauges and Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Temperature Gauge */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Temperature</h4>
                    <span className="text-orange-500">🌡️</span>
                  </div>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="#f97316" strokeWidth="8" fill="none"
                        strokeDasharray="251.2" strokeDashoffset="75.36"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">27°C</div>
                        <div className="text-xs text-gray-500">Normal</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0°</span>
                    <span>50°</span>
                  </div>
                </div>

                {/* Toxic Gas Level Gauge */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Toxic Gas Level</h4>
                    <span className="text-red-500">⚠️</span>
                  </div>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="#ef4444" strokeWidth="8" fill="none"
                        strokeDasharray="251.2" strokeDashoffset="200.96"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">22</div>
                        <div className="text-xs text-gray-500">Index</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0</span>
                    <span>100</span>
                  </div>
                </div>

                {/* Humidity Gauge */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-sm transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Humidity</h4>
                    <span className="text-blue-500">💧</span>
                  </div>
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" stroke="#f3f4f6" strokeWidth="8" fill="none" />
                      <circle 
                        cx="50" cy="50" r="40" 
                        stroke="#3b82f6" strokeWidth="8" fill="none"
                        strokeDasharray="251.2" strokeDashoffset="88.42"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">65%</div>
                        <div className="text-xs text-gray-500">RH</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Machine A", status: "Running", color: "green" },
                  { label: "Machine B", status: "Running", color: "green" },
                  { label: "Machine C", status: "Maintenance", color: "yellow" },
                  { label: "Machine D", status: "Offline", color: "red" }
                ].map((machine, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-100 hover:shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{machine.label}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        machine.color === 'green' ? 'bg-green-400' :
                        machine.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'
                      } animate-pulse`}></div>
                    </div>
                    <div className={`text-xs mt-1 ${
                      machine.color === 'green' ? 'text-green-600' :
                      machine.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {machine.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action */}
              <div className="mt-6 text-center">
                <a 
                  href="/dashboard" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
                >
                  View Full Dashboard
                  <HiOutlineArrowRight className="w-4 h-4 ml-2" />
                </a>
              </div>
            </div>

            {/* Animated Border */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-400 to-red-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 relative inline-block">
              <span className="absolute -left-8 top-1/2 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></span>
              Powerful Features
              <span className="absolute -right-8 top-1/2 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to optimize your industrial operations
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <HiOutlineChartBar className="w-6 h-6 text-red-500" />,
                title: "Realtime Analytics",
                description: "Live KPIs, alerts, and predictive analytics for proactive decision making.",
                color: "text-red-500"
              },
              {
                icon: <HiOutlineLightningBolt className="w-6 h-6 text-blue-500" />,
                title: "Workflow Automation",
                description: "Customizable checklists, automated task assignments, and reminders.",
                color: "text-blue-500"
              },
              {
                icon: <HiOutlineUsers className="w-6 h-6 text-green-500" />,
                title: "Employee Management",
                description: "Optimized shift planning, attendance tracking, and performance analytics.",
                color: "text-green-500"
              },
              {
                icon: <HiOutlineCog className="w-6 h-6 text-purple-500" />,
                title: "Asset Tracking",
                description: "Monitor equipment status, maintenance schedules, and utilization rates.",
                color: "text-purple-500"
              },
              {
                icon: <HiOutlineShieldCheck className="w-6 h-6 text-yellow-500" />,
                title: "Safety Compliance",
                description: "Ensure regulatory compliance with automated safety checks and reports.",
                color: "text-yellow-500"
              },
              {
                icon: <HiOutlineDatabase className="w-6 h-6 text-indigo-500" />,
                title: "Data Integration",
                description: "Connect with existing ERP, MES, and other enterprise systems.",
                color: "text-indigo-500"
              },
              {
                icon: <HiOutlineBell className="w-6 h-6 text-pink-500" />,
                title: "Smart Alerts",
                description: "Customizable notifications for critical events and anomalies.",
                color: "text-pink-500"
              },
              {
                icon: <HiOutlineChartPie className="w-6 h-6 text-cyan-500" />,
                title: "Custom Reports",
                description: "Generate detailed reports with drag-and-drop dashboard builder.",
                color: "text-cyan-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group hover:border-red-200"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm group-hover:shadow-sm ${feature.color} transition-all duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">{feature.title}</h3>
                <p className="mt-2 text-gray-600 group-hover:text-gray-700 transition-colors text-sm">{feature.description}</p>
                <a href="#" className="inline-flex items-center mt-4 text-sm font-medium text-red-500 hover:text-red-600 transition-colors">
                  Learn more
                  <HiOutlineArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 relative inline-block">
              <span className="absolute -left-8 top-1/2 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></span>
              Trusted by Industry Leaders
              <span className="absolute -right-8 top-1/2 w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></span>
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join thousands of companies transforming their operations
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Reduced our downtime by 40% with predictive maintenance alerts.",
                name: "Sarah Johnson",
                title: "COO, Manufacturing Corp",
                avatar: "SJ"
              },
              {
                quote: "The workforce scheduling tools saved us hundreds of hours each month.",
                name: "Michael Chen",
                title: "Operations Director, Logistics Inc",
                avatar: "MC"
              },
              {
                quote: "Real-time dashboards gave us visibility we never had before.",
                name: "David Wilson",
                title: "Plant Manager, Industrial Solutions",
                avatar: "DW"
              }
            ].map((testimonial, index) => (
              <div 
                key={index}
                className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <svg className="w-6 h-6 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="text-gray-700 italic text-sm">"{testimonial.quote}"</p>
                <div className="flex items-center mt-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-medium shadow-xs">
                    {testimonial.avatar}
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-900 font-medium text-sm">{testimonial.name}</p>
                    <p className="text-gray-500 text-xs">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-24 bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
          <div className="px-6 py-12 md:py-14 text-center">
            <h2 className="text-3xl font-bold text-white">Ready to transform your operations?</h2>
            <p className="mt-3 text-gray-100 max-w-2xl mx-auto">
              Join thousands of industry leaders who trust our platform
            </p>
            <div className="mt-6">
              <a
                href="/signup"
                className="relative inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-red-600 transition-all duration-300 bg-white rounded-lg hover:bg-gray-50 shadow-md hover:shadow-lg group-hover:scale-[1.02]"
              >
                Start Free Trial
                <HiOutlineArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                <span className="absolute inset-0 rounded-lg border-2 border-transparent group-hover:border-white/20 transition-all duration-300"></span>
              </a>
              <p className="mt-3 text-sm text-red-100">No credit card required • 14-day trial</p>
            </div>
          </div>
        </section>
      </div>

      {/* Add this to your global CSS or style tag */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}