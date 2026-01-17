import React from 'react';
import type { RawPull, UserRawPull, Banner } from '../../types';
import { transformUserData } from '../../utils/helpers';
import Modal from './Modal';
import UploadIcon from '../icons/UploadIcon';
import SaveIcon from '../icons/SaveIcon';

interface DataManagementModalProps {
  rawPulls: RawPull[];
  banners: Banner[];
  onDataLoad: (data: RawPull[]) => void;
  onBannersLoad: (data: Banner[]) => void;
  onClose: () => void;
}

const DataManagementModal: React.FC<DataManagementModalProps> = ({ rawPulls, banners, onDataLoad, onBannersLoad, onClose }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result;
          if (typeof content === 'string') {
            const data = JSON.parse(content);
            let pullsFound = false;
            let bannersFound = false;

            if (data && typeof data === 'object' && !Array.isArray(data) && 'pulls' in data && 'banners' in data) {
                onDataLoad(data.pulls as RawPull[]);
                onBannersLoad(data.banners as Banner[]);
                pullsFound = true;
                bannersFound = true;
            } 
            else if (Array.isArray(data)) {
                if (data.length === 0) {
                    alert('업로드한 파일에 데이터가 없습니다.');
                }
                else if ('name' in data[0] && 'type' in data[0] && 'rateUp6Stars' in data[0]) {
                    onBannersLoad(data as Banner[]);
                    bannersFound = true;
                }
                else if ('charId' in data[0] && 'charName' in data[0] && 'poolName' in data[0] && 'star' in data[0] && 'at' in data[0]) {
                    const transformed = transformUserData(data as UserRawPull[]);
                    onDataLoad(transformed);
                    pullsFound = true;
                } 
                else if ('pool' in data[0] && 'chars' in data[0] && 'ts' in data[0]) {
                    onDataLoad(data as RawPull[]);
                    pullsFound = true;
                }
            }

            if (pullsFound || bannersFound) {
                onClose();
            } else if (!Array.isArray(data) || data.length > 0) { 
                alert('지원하지 않는 JSON 파일 형식입니다. 업로드한 파일이 올바른 가챠 기록 또는 픽업 정보 파일인지 확인해주세요.');
            }
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert('JSON 파일을 파싱하는 중 오류가 발생했습니다.');
        } finally {
            if(event.target) {
                event.target.value = '';
            }
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExportCombined = () => {
    if (rawPulls.length === 0 && banners.length === 0) {
      alert('저장할 데이터가 없습니다.');
      return;
    }
    const dataToSave = {
        pulls: rawPulls,
        banners: banners,
    };
    const dataStr = JSON.stringify(dataToSave, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'arknights_headhunting_backup.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportBanners = () => {
    if (banners.length === 0) {
      alert('내보낼 픽업 데이터가 없습니다.');
      return;
    }
    const dataStr = JSON.stringify(banners, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'arknights_banners_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Modal title="데이터 관리" onClose={onClose} size="lg">
        <div className="space-y-6">
            <section>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">데이터 가져오기</h3>
                <div className="bg-gray-700/50 p-4 rounded-lg">
                    <p className="text-sm text-gray-300 mb-4">
                        뽑기 기록, 픽업 정보, 또는 둘 다 포함된 통합 백업 파일을 업로드하여 데이터를 불러올 수 있습니다.
                    </p>
                    <input type="file" id="json-file-upload" accept=".json" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="json-file-upload" className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 rounded-md text-white font-semibold transition-colors duration-200">
                        <UploadIcon /> JSON 파일 선택
                    </label>
                </div>
            </section>
            <section>
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">데이터 내보내기</h3>
                 <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
                    <button onClick={handleExportCombined} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition-colors duration-200">
                        <SaveIcon /> 통합 데이터 백업 (뽑기 + 픽업)
                    </button>
                    <button onClick={handleExportBanners} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold transition-colors duration-200">
                        <SaveIcon /> 픽업 데이터만 백업
                    </button>
                </div>
            </section>
        </div>
    </Modal>
  );
};

// FIX: Completed the truncated file and added the missing default export.
export default DataManagementModal;
