import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  CreditCard,
  PieChart,
  Settings,
  User,
  LogOut
} from 'lucide-react';

const Dashboard = ({ onLogout }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recentTransactions] = useState([
    { id: 1, description: 'Coffee at Starbucks', amount: -4.50, category: 'Food & Drinks', date: '2025-01-07', type: 'expense' },
    { id: 2, description: 'Salary Deposit', amount: 3500.00, category: 'Income', date: '2025-01-05', type: 'income' },
    { id: 3, description: 'Grocery Shopping', amount: -87.32, category: 'Food & Drinks', date: '2025-01-04', type: 'expense' },
    { id: 4, description: 'Gas Station', amount: -45.00, category: 'Transportation', date: '2025-01-03', type: 'expense' },
  ]);

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // This will be connected to Whisper later
      console.log('Starting voice recording...');
    } else {
      console.log('Stopping voice recording...');
    }
  };

  const stats = [
    {
      title: 'Monthly Income',
      value: '$3,500.00',
      change: '+12.5%',
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      title: 'Monthly Expenses',
      value: '$2,147.82',
      change: '-8.2%',
      trend: 'down',
      icon: <TrendingDown className="w-6 h-6" />
    },
    {
      title: 'Available Balance',
      value: '$1,352.18',
      change: '+24.7%',
      trend: 'up',
      icon: <DollarSign className="w-6 h-6" />
    },
    {
      title: 'Transactions',
      value: '47',
      change: '+5',
      trend: 'up',
      icon: <CreditCard className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">VoiceFinance</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <User className="w-5 h-5" />
              </button>
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                onClick={onLogout}
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Voice Input Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Voice Transaction Input</h2>
                <p className="text-primary-100">
                  {isRecording 
                    ? 'Listening... Speak your transaction details'
                    : 'Click to start recording your transaction'
                  }
                </p>
              </div>
              <button
                onClick={handleVoiceToggle}
                className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 ${
                  isRecording 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                    <Plus className="w-4 h-4" />
                    <span>Add Manual</span>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Analytics */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">View Monthly Report</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <PieChart className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Category Analysis</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                  <span className="font-medium">Export Data</span>
                </button>
              </div>
            </div>

            {/* Spending Insights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending Insights</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Food & Drinks</span>
                    <span className="font-medium">42%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary-600 h-2 rounded-full" style={{width: '42%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Transportation</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '28%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Shopping</span>
                    <span className="font-medium">20%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: '20%'}}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Others</span>
                    <span className="font-medium">10%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '10%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
