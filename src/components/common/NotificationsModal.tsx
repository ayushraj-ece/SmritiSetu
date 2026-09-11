import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCheck, Trash2, Users, Pill, Gamepad2, AlertTriangle, ShieldCheck, Check, Clock } from 'lucide-react';
import { dataService } from '../../services/dataService';
import type { AppNotification } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  patientId?: string;
  role?: 'caregiver' | 'patient';
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userId = 'caregiver_user',
  patientId,
  role = 'caregiver'
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'doctor_pairing_request' | 'pairing_request' | 'medication_alert' | 'game_result'>('all');
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const targetId = patientId || userId;
    const unsub = dataService.subscribeUserNotifications(targetId, (list) => {
      setNotifications(list);
    });
    return () => unsub();
  }, [isOpen, userId, patientId, role]);

  if (!isOpen) return null;

  const handleMarkRead = async (id: string) => {
    await dataService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAll = async () => {
    await dataService.clearAllNotifications();
    setNotifications([]);
  };

  const handleMarkAllRead = async () => {
    notifications.forEach(n => dataService.markNotificationAsRead(n.id));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleAcceptDoctorPairing = async (n: AppNotification) => {
    if (!n.pairingRequestId) return;
    setActionStatus(prev => ({ ...prev, [n.id]: 'accepting' }));
    await dataService.respondDoctorPairingRequest(n.pairingRequestId, 'accepted', role);
    await dataService.markNotificationAsRead(n.id);
    setActionStatus(prev => ({ ...prev, [n.id]: 'accepted' }));
  };

  const handleDeclineDoctorPairing = async (n: AppNotification) => {
    if (!n.pairingRequestId) return;
    setActionStatus(prev => ({ ...prev, [n.id]: 'declining' }));
    await dataService.respondDoctorPairingRequest(n.pairingRequestId, 'rejected', role);
    await dataService.markNotificationAsRead(n.id);
    setActionStatus(prev => ({ ...prev, [n.id]: 'declined' }));
  };

  const filteredNotifs = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'doctor_pairing_request') return n.type === 'doctor_pairing_request';
    if (filter === 'pairing_request') return n.type === 'pairing_request';
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const EXPIRATION_48H_MS = 48 * 60 * 60 * 1000;

  const formatTimeAgo = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'doctor_pairing_request':
      case 'pairing_request':
        return <Users className="w-5 h-5 text-[#0284C7]" />;
      case 'medication_alert':
        return <Pill className="w-5 h-5 text-emerald-600" />;
      case 'game_result':
        return <Gamepad2 className="w-5 h-5 text-purple-600" />;
      case 'emergency':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <ShieldCheck className="w-5 h-5 text-sky-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm sm:max-w-md w-full space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-[#0284C7] flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 leading-tight">Notifications Center</h3>
              <p className="text-[11px] text-slate-400 font-medium">{unreadCount} unread alert{unreadCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold">
          {[
            { id: 'all', label: 'All' },
            { id: 'doctor_pairing_request', label: 'Doctor Pairing' },
            { id: 'pairing_request', label: 'Caregiver Pairing' },
            { id: 'medication_alert', label: 'Medicine' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-[#0284C7] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {filteredNotifs.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No Active Notifications</p>
              <p className="text-[11px] text-slate-400 font-medium">You are all caught up!</p>
            </div>
          ) : (
            filteredNotifs.map((n) => {
              const isDoctorReq = n.type === 'doctor_pairing_request' || n.type === 'pairing_request';
              const isExpired = (Date.now() - n.timestamp) > EXPIRATION_48H_MS;
              const currentAction = actionStatus[n.id];

              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkRead(n.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 relative ${
                    n.read ? 'bg-slate-50/70 border-slate-100 opacity-85' : 'bg-sky-50/50 border-sky-100 shadow-2xs'
                  }`}
                >
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-[#0284C7] absolute top-4 right-3" />
                  )}
                  <div className="w-9 h-9 rounded-xl bg-white shadow-2xs border border-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-extrabold text-slate-900 truncate">{n.title}</h4>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">{formatTimeAgo(n.timestamp)}</span>
                    </div>

                    <p className="text-[11px] text-slate-600 font-medium leading-snug">{n.message}</p>

                    {/* Expiration Badge */}
                    {isDoctorReq && (
                      <div className="flex items-center gap-1 text-[10px] font-bold mt-1">
                        <Clock className="w-3 h-3 text-amber-500" />
                        <span className={isExpired ? 'text-red-500' : 'text-amber-600'}>
                          {isExpired ? 'Expired (48h Limit)' : 'Retained 48h for approval'}
                        </span>
                      </div>
                    )}

                    {/* Inline Interactive Actions for Doctor / Caregiver Pairing */}
                    {isDoctorReq && !isExpired && n.pairingRequestId && (
                      <div className="pt-2 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {currentAction === 'accepted' ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Pairing Authorized
                          </span>
                        ) : currentAction === 'declined' ? (
                          <span className="text-xs font-bold text-slate-500">Pairing Declined</span>
                        ) : (
                          <>
                            <button
                              onClick={() => handleAcceptDoctorPairing(n)}
                              disabled={!!currentAction}
                              className="px-3 py-1 bg-[#0284C7] hover:bg-[#0369A1] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" /> Authorize
                            </button>
                            <button
                              onClick={() => handleDeclineDoctorPairing(n)}
                              disabled={!!currentAction}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="text-[#0284C7] hover:text-[#0369A1] disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            className="text-slate-400 hover:text-red-600 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear all</span>
          </button>
        </div>

      </div>
    </div>
  );
};
