"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, ChevronRight, LayoutDashboard, User } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useTranslation } from 'react-i18next';

interface Staff {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  status: 'Active' | 'Inactive';
  joinDate: string;
  dayOff: string;
  image: string | null;
}

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffDashboard() {
  const { t } = useTranslation();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  const todayNameEn = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  useEffect(() => {
    const role = localStorage.getItem('userRole') || 'staff';
    const email = localStorage.getItem('userEmail') || '';
    setUserRole(role);
    setUserEmail(email);

    const savedStaff = localStorage.getItem('zway_staff_data');
    if (savedStaff) {
      setStaffList(JSON.parse(savedStaff));
    }
  }, []);

  const myData = staffList.find(s => s.email === userEmail);
  const isAdmin = userRole === 'admin';
  const displayStaff = isAdmin ? staffList : (myData ? [myData] : []);
  const staffOffToday = displayStaff.filter(s => s.dayOff === todayNameEn);

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-gray-800 font-sans italic text-left">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        
        <motion.main initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {isAdmin ? t('all_staff_schedule') : t('personal_schedule')}
              </h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                {isAdmin ? "Admin Overview" : `${t('hello')} ${myData?.name || 'Staff'}`}
              </p>
            </div>
            <div className="px-6 py-3 bg-black rounded-2xl text-white flex items-center gap-3">
              <Calendar size={18} className="text-rose-500" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">
                {t('today')}: {t(`day_${todayNameEn.toLowerCase()}`)}
              </span>
            </div>
          </div>

          {/* My Day Off Card (សម្រាប់តែ Staff) */}
          {!isAdmin && myData && (
            <div className="bg-white p-8 rounded-[40px] border-l-8 border-l-black shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('your_day_off_is')}</p>
                <p className="text-4xl font-black text-black italic uppercase">
                  {t(`day_${myData.dayOff.toLowerCase()}`)}
                </p>
                <p className="text-xs font-bold text-rose-500 mt-2 uppercase">
                  {myData.dayOff === todayNameEn ? `★ ${t('it_is_your_day_off')}` : t('happy_working_day')}
                </p>
              </div>
              <div className="hidden md:block opacity-10">
                <Clock size={80} strokeWidth={3} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Weekly View */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <LayoutDashboard size={20} />
                <h2 className="text-lg font-black uppercase tracking-tighter italic">
                  {isAdmin ? t('weekly_schedule_all') : t('check_schedule')}
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {DAYS_OF_WEEK.map((day) => {
                  const staffOnDay = displayStaff.filter(s => s.dayOff === day);
                  const isToday = day === todayNameEn;
                  const isMyDayOff = !isAdmin && myData?.dayOff === day;
                  
                  return (
                    <div key={day} className={`p-6 rounded-[30px] border transition-all ${
                      isMyDayOff ? 'bg-rose-500 text-white border-rose-600 shadow-xl' : 
                      isToday ? 'bg-black text-white border-black shadow-lg' : 'bg-white border-gray-100'
                    }`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isToday || isMyDayOff ? 'text-white/70' : 'text-gray-400'}`}>
                          {t(`day_${day.toLowerCase()}`)} {isToday && `(${t('today')})`}
                        </span>
                        {isMyDayOff && <User size={16} />}
                      </div>
                      
                      <div className="flex -space-x-3 overflow-hidden">
                        {staffOnDay.length > 0 ? (
                          staffOnDay.map((s) => (
                            <div key={s.id} className="w-10 h-10 rounded-xl border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                              {s.image ? <img src={s.image} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black text-zinc-400">{s.name.charAt(0)}</span>}
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] font-bold uppercase opacity-30">{t('no_data')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Today's Off List */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-rose-500" />
                <h2 className="text-lg font-black uppercase tracking-tighter italic">
                  {isAdmin ? t('off_today') : t('today_status')}
                </h2>
              </div>

              <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-6 space-y-4">
                {staffOffToday.length > 0 ? (
                  staffOffToday.map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-transparent">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center font-black overflow-hidden">
                          {staff.image ? <img src={staff.image} className="w-full h-full object-cover" /> : staff.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase italic tracking-tighter">{staff.name}</p>
                          <p className="text-[10px] font-bold text-rose-500 uppercase">{t('off_duty')}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-xs font-black text-gray-300 uppercase italic">
                      {isAdmin ? t('no_one_off') : t('you_are_on_duty')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}