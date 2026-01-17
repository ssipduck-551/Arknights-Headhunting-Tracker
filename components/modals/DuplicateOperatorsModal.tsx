import React from 'react';
import type { OperatorCount } from '../../types';
import Modal from './Modal';
import { handleImageError } from '../../utils/helpers';

interface DuplicateOperatorsModalProps {
  sixStarCounts: OperatorCount[];
  fiveStarCounts: OperatorCount[];
  showFiveStars: boolean;
  onClose: () => void;
}

const DuplicateOperatorList: React.FC<{ title: string; counts: OperatorCount[] }> = ({ title, counts }) => {
    const filteredCounts = counts.filter(op => op.count >= 2);
    return (
        <div>
            <h4 className="text-md font-semibold text-yellow-400 mb-3">{title}</h4>
            <div className="bg-gray-800 p-4 rounded-lg min-h-[100px]">
                {filteredCounts.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {filteredCounts.map(op => (
                            <div key={op.charId} className="relative flex-shrink-0" title={`${op.name} - ${op.count}회`}>
                                <img
                                    src={`https://raw.githubusercontent.com/fexli/ArknightsResource/main/avatar/ASSISTANT/${op.charId}.png`}
                                    alt={op.name}
                                    className="w-16 h-16 rounded-full object-cover bg-gray-700 ring-2 ring-gray-600"
                                    onError={handleImageError}
                                />
                                <div className="absolute -bottom-1 -right-1 bg-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold text-white border-2 border-gray-800">
                                    {op.count}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <div className="flex items-center justify-center h-full"><p className="text-gray-500 text-center py-4">데이터 없음</p></div>}
            </div>
        </div>
    );
};

const DuplicateOperatorsModal: React.FC<DuplicateOperatorsModalProps> = ({ sixStarCounts, fiveStarCounts, showFiveStars, onClose }) => {
  return (
    <Modal title="중복 획득 오퍼레이터" onClose={onClose} size="2xl">
      <div className="space-y-6">
        <DuplicateOperatorList title="6★ 중복 획득" counts={sixStarCounts} />
        {showFiveStars && <DuplicateOperatorList title="5★ 중복 획득" counts={fiveStarCounts} />}
      </div>
    </Modal>
  );
};

export default DuplicateOperatorsModal;