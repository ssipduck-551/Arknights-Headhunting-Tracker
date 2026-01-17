
import React, { useState, useEffect } from 'react';
import type { Banner } from '../../types';
import { BannerType } from '../../types';
import TrashIcon from '../icons/TrashIcon';

interface ManageBannersModalProps {
  banners: Banner[];
  onSave: (banners: Banner[]) => void;
  onClose: () => void;
}

const ManageBannersModal: React.FC<ManageBannersModalProps> = ({ banners: initialBanners, onSave, onClose }) => {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isAdding, setIsAdding] = useState(false);
  const [newBanner, setNewBanner] = useState<{ name: string; type: BannerType }>({
    name: '',
    type: BannerType.STANDARD,
  });

  const [rateUpInput, setRateUpInput] = useState('');
  const [standardRateUpInput, setStandardRateUpInput] = useState('');

  useEffect(() => {
    if (isAdding) {
      setRateUpInput('');
      setStandardRateUpInput('');
    }
  }, [newBanner.type, isAdding]);

  const handleStartAdding = () => {
    setNewBanner({ name: '', type: BannerType.STANDARD });
    setIsAdding(true);
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
  };

  const handleAddBanner = () => {
    if (!newBanner.name.trim()) {
      alert('픽업 이름을 입력해주세요.');
      return;
    }
    
    const finalBanner: Banner = {
      name: newBanner.name.trim(),
      type: newBanner.type,
      rateUp6Stars: rateUpInput.split(',').map(s => s.trim()).filter(Boolean),
      standardRateUp6Stars: (newBanner.type === BannerType.LIMITED || newBanner.type === BannerType.COLLAB)
        ? standardRateUpInput.split(',').map(s => s.trim()).filter(Boolean)
        : [],
    };
    
    setBanners([...banners, finalBanner]);
    setIsAdding(false);
  };

  const handleDeleteBanner = (name: string) => {
    setBanners(banners.filter(b => b.name !== name));
  };

  const handleSaveAndClose = () => {
    onSave(banners);
    onClose();
  };

  const renderBannerForm = () => {
    const isSpecialBanner = newBanner.type === BannerType.LIMITED || newBanner.type === BannerType.COLLAB;
    
    let mainRateUpLabel = '';
    if (newBanner.type === BannerType.LIMITED) {
      mainRateUpLabel = '한정 픽업 6★ (쉼표로 구분)';
    } else if (newBanner.type === BannerType.COLLAB) {
      mainRateUpLabel = '콜라보 픽업 6★ (쉼표로 구분)';
    }

    return (
      <div className="bg-gray-700/50 p-4 rounded-lg mt-4 border border-gray-600">
        <h3 className="text-lg font-semibold mb-3">새 픽업 정보 추가</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">픽업 이름 (JSON 데이터와 일치)</label>
            <input type="text" value={newBanner.name} onChange={e => setNewBanner({ ...newBanner, name: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3"/>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">픽업 유형</label>
            <select value={newBanner.type} onChange={e => setNewBanner({ ...newBanner, type: e.target.value as BannerType })} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3">
              <option value={BannerType.STANDARD}>상시 (Standard)</option>
              <option value={BannerType.LIMITED}>한정 (Limited)</option>
              <option value={BannerType.COLLAB}>콜라보 (Collaboration)</option>
            </select>
          </div>
          {isSpecialBanner ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">{mainRateUpLabel}</label>
                <input type="text" placeholder="예: W, 로즈몬티스" value={rateUpInput} onChange={e => setRateUpInput(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3"/>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">통상 픽업 6★ (쉼표로 구분, 없으면 비워둠)</label>
                <input type="text" placeholder="예: 머드락" value={standardRateUpInput} onChange={e => setStandardRateUpInput(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3"/>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-1">픽업 6★ 오퍼레이터 (쉼표로 구분)</label>
              <input type="text" placeholder="예: 쏜즈, 수르트" value={rateUpInput} onChange={e => setRateUpInput(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3"/>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button onClick={handleCancelAdd} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md font-semibold">취소</button>
            <button onClick={handleAddBanner} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold">추가</button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">픽업 데이터 관리</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <button onClick={handleStartAdding} className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-md font-semibold text-lg transition-colors">
            + 새 픽업 정보 추가
          </button>
          {isAdding && renderBannerForm()}
          <div className="space-y-3">
            {banners.map(banner => (
              <div key={banner.name} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg">{banner.name}</h4>
                    <p className="text-sm text-gray-400 uppercase">{banner.type}</p>
                    <div className="text-sm mt-2">
                      {banner.type === BannerType.LIMITED ? (
                        <>
                          <p><span className="text-red-400 font-semibold">한정:</span> {banner.rateUp6Stars.join(', ')}</p>
                          {banner.standardRateUp6Stars && banner.standardRateUp6Stars.length > 0 && <p><span className="text-blue-400 font-semibold">통상:</span> {banner.standardRateUp6Stars.join(', ')}</p>}
                        </>
                      ) : banner.type === BannerType.COLLAB ? (
                        <>
                          <p><span className="text-purple-400 font-semibold">콜라보:</span> {banner.rateUp6Stars.join(', ')}</p>
                          {banner.standardRateUp6Stars && banner.standardRateUp6Stars.length > 0 && <p><span className="text-blue-400 font-semibold">통상:</span> {banner.standardRateUp6Stars.join(', ')}</p>}
                        </>
                      ) : (
                         <p><span className="text-blue-400 font-semibold">통상:</span> {banner.rateUp6Stars.join(', ')}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <button onClick={() => handleDeleteBanner(banner.name)} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md text-sm font-semibold flex items-center gap-1">
                        <TrashIcon className="w-4 h-4" /> 삭제
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 border-t border-gray-700 mt-auto">
          <button onClick={handleSaveAndClose} className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold text-lg transition-colors">
            저장 후 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageBannersModal;