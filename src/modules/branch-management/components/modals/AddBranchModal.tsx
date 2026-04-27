"use client";

import { useState } from 'react';
import { X, Storefront, MapPin, Phone, Clock, User } from '@phosphor-icons/react';
import type { CreateBranchDto } from '@/src/shared/types/branch.types';
import type { UserSearchResultDto } from '@/src/shared/types/branch.types';
import { validateBranchForm } from '../../utils/validation';
import { SearchInput } from '../shared/SearchInput';
import { useUserSearch } from '@/src/shared/hooks/useUserSearch';

interface AddBranchModalProps {
  onClose: () => void;
  onSave: (data: CreateBranchDto) => Promise<void>;
}

export function AddBranchModal({ onClose, onSave }: AddBranchModalProps) {
  const [formData, setFormData] = useState<Omit<CreateBranchDto, 'managerId'> & { managerId?: string }>({
    name: '',
    address: '',
    phone: '',
    avatarUrl: '',
    latitude: undefined,
    longitude: undefined,
    openTime: '06:00:00',
    closeTime: '22:00:00',
    managerId: undefined,
  });

  const [selectedManager, setSelectedManager] = useState<UserSearchResultDto | null>(null);
  const [showManagerSearch, setShowManagerSearch] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { users, loading: searchLoading, setSearchTerm } = useUserSearch({
    eligibleForManager: true,
    pageSize: 5,
  });

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleManagerSelect = (manager: UserSearchResultDto) => {
    setSelectedManager(manager);
    setFormData(prev => ({ ...prev, managerId: manager.id }));
    setShowManagerSearch(false);
  };

  const handleSave = async () => {
    // Validate form
    const errors = validateBranchForm({
      name: formData.name,
      address: formData.address,
      openTime: formData.openTime,
      closeTime: formData.closeTime,
      phone: formData.phone,
    });

    if (!formData.managerId) {
      errors.push({ field: 'managerId', message: 'Vui lòng chọn quản lý chi nhánh' });
    }

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      errors.forEach(err => {
        errorMap[err.field] = err.message;
      });
      setValidationErrors(errorMap);
      return;
    }

    setSaving(true);
    try {
      await onSave(formData as CreateBranchDto);
      onClose();
    } catch (err) {
      // Error handled by parent
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B5E38]/10">
              <Storefront className="h-5 w-5 text-[#1B5E38]" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Thêm chi nhánh mới</h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Tên chi nhánh *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nhập tên chi nhánh"
                className={`w-full rounded-xl border ${
                  validationErrors.name ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                } px-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20`}
              />
              {validationErrors.name && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                  className={`w-full rounded-xl border ${
                    validationErrors.phone ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } pl-11 pr-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20`}
                />
              </div>
              {validationErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                URL ảnh đại diện
              </label>
              <input
                type="text"
                value={formData.avatarUrl}
                onChange={(e) => handleInputChange('avatarUrl', e.target.value)}
                placeholder="https://example.com/branch-logo.jpg"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20"
              />
              <p className="mt-1 text-xs text-slate-500">URL hình ảnh đại diện cho chi nhánh (tùy chọn)</p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Địa chỉ *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Nhập địa chỉ chi nhánh"
                  rows={2}
                  className={`w-full rounded-xl border ${
                    validationErrors.address ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } pl-11 pr-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20 resize-none`}
                />
              </div>
              {validationErrors.address && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Vĩ độ (Latitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude || ''}
                onChange={(e) => handleInputChange('latitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="10.762622"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20"
              />
              <p className="mt-1 text-xs text-slate-500">Tọa độ GPS (tùy chọn)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Kinh độ (Longitude)
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude || ''}
                onChange={(e) => handleInputChange('longitude', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="106.660172"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20"
              />
              <p className="mt-1 text-xs text-slate-500">Tọa độ GPS (tùy chọn)</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Giờ mở cửa *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  value={formData.openTime.substring(0, 5)}
                  onChange={(e) => handleInputChange('openTime', e.target.value + ':00')}
                  className={`w-full rounded-xl border ${
                    validationErrors.openTime ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } pl-11 pr-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20`}
                />
              </div>
              {validationErrors.openTime && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.openTime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Giờ đóng cửa *
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="time"
                  value={formData.closeTime.substring(0, 5)}
                  onChange={(e) => handleInputChange('closeTime', e.target.value + ':00')}
                  className={`w-full rounded-xl border ${
                    validationErrors.closeTime ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                  } pl-11 pr-4 py-3 text-sm text-slate-700 outline-none transition-colors hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white focus:ring-2 focus:ring-[#1B5E38]/20`}
                />
              </div>
              {validationErrors.closeTime && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.closeTime}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                Quản lý chi nhánh *
              </label>
              {selectedManager ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1B5E38]/10">
                    <User className="h-5 w-5 text-[#1B5E38]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{selectedManager.fullName}</p>
                    <p className="text-xs text-slate-500">{selectedManager.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedManager(null);
                      setFormData(prev => ({ ...prev, managerId: undefined }));
                    }}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setShowManagerSearch(!showManagerSearch)}
                    className={`w-full rounded-xl border ${
                      validationErrors.managerId ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50'
                    } px-4 py-3 text-left text-sm text-slate-500 hover:border-[#1B5E38] focus:border-[#1B5E38] focus:bg-white transition-colors`}
                  >
                    Chọn quản lý chi nhánh
                  </button>
                  
                  {showManagerSearch && (
                    <div className="mt-2 p-4 border border-slate-200 rounded-xl bg-white">
                      <SearchInput
                        placeholder="Tìm kiếm người dùng..."
                        onSearch={setSearchTerm}
                        loading={searchLoading}
                      />
                      
                      <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                        {users?.items.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleManagerSelect(user)}
                            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                          >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                              <User className="h-4 w-4 text-slate-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            {user.isEligibleForManager && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Đủ điều kiện
                              </span>
                            )}
                          </button>
                        ))}
                        
                        {users?.items.length === 0 && (
                          <p className="text-sm text-slate-500 text-center py-4">
                            Không tìm thấy người dùng phù hợp
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {validationErrors.managerId && (
                <p className="mt-1 text-xs text-red-600">{validationErrors.managerId}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #2A9D5C 0%, #1B5E38 100%)",
              boxShadow: "0 4px 14px rgba(27, 94, 56, 0.35)",
            }}
          >
            {saving ? 'Đang tạo...' : 'Tạo chi nhánh'}
          </button>
        </div>
      </div>
    </div>
  );
}