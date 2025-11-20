import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, CloseIcon, TrophyIcon } from './Icons';

interface StudentQuest {
  id: number;
  title: string;
  description: string;
  quest_type: 'drawing' | 'poster' | 'essay' | 'cleanup' | 'presentation' | 'video';
  karma_reward: number;
  deadline?: Date;
  grade?: number;
  section?: string;
  completed?: boolean;
}

interface StudentQuestsModalProps {
  onClose: () => void;
  onSubmitQuest: (questId: number, proof: File) => void;
  schoolId?: number;
}

const StudentQuestsModal: React.FC<StudentQuestsModalProps> = ({
  onClose,
  onSubmitQuest,
  schoolId,
}) => {
  const [quests, setQuests] = useState<StudentQuest[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<StudentQuest | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock quests - replace with API call
    const mockQuests: StudentQuest[] = [
      {
        id: 1,
        title: 'Draw a Poster on River Pollution',
        description:
          'Create a colorful poster showing how we can keep our rivers clean. Include at least 3 ways to prevent pollution.',
        quest_type: 'poster',
        karma_reward: 50,
        grade: 8,
        section: 'A',
        completed: false,
      },
      {
        id: 2,
        title: 'Write an Essay on Waste Segregation',
        description:
          'Write a 300-word essay explaining the importance of separating organic and inorganic waste at home.',
        quest_type: 'essay',
        karma_reward: 40,
        grade: 8,
        section: 'A',
        completed: false,
      },
      {
        id: 3,
        title: 'Clean Your School Playground',
        description:
          'Organize a cleanup drive with your classmates. Take before and after photos as proof.',
        quest_type: 'cleanup',
        karma_reward: 75,
        grade: 8,
        section: 'A',
        completed: false,
      },
      {
        id: 4,
        title: 'Create a Composting Video',
        description:
          'Make a short video (2-3 minutes) showing how to compost kitchen waste at home.',
        quest_type: 'video',
        karma_reward: 60,
        grade: 8,
        section: 'A',
        completed: false,
      },
    ];
    setQuests(mockQuests);
    setLoading(false);
  }, [schoolId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedQuest && proofFile) {
      onSubmitQuest(selectedQuest.id, proofFile);
      setSelectedQuest(null);
      setProofFile(null);
      onClose();
    }
  };

  const getQuestIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      drawing: '🎨',
      poster: '📋',
      essay: '✍️',
      cleanup: '🧹',
      presentation: '📊',
      video: '🎥',
    };
    return iconMap[type] || '📝';
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">📚 Student Quests</h2>
              <p className="text-purple-100 text-sm mt-1">Complete quests to earn Karma Coins!</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading quests...</p>
            </div>
          ) : selectedQuest ? (
            /* Submit Quest Form */
            <div>
              <button
                onClick={() => setSelectedQuest(null)}
                className="text-purple-600 mb-4 flex items-center gap-2 hover:underline"
              >
                ← Back to quests
              </button>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{getQuestIcon(selectedQuest.quest_type)}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedQuest.title}</h3>
                    <p className="text-gray-700 mb-3">{selectedQuest.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                        +{selectedQuest.karma_reward} Karma
                      </span>
                      <span className="text-gray-600">
                        Grade {selectedQuest.grade} • Section {selectedQuest.section}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Your Work
                  </label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Accepted: Images, Videos, PDF, Word documents
                  </p>
                </div>

                {proofFile && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 flex items-center gap-2">
                      <CheckCircleIcon className="w-5 h-5" />
                      File selected: {proofFile.name}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!proofFile}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Quest
                </button>
              </div>
            </div>
          ) : (
            /* Quest List */
            <div className="space-y-4">
              {quests.map(quest => (
                <div
                  key={quest.id}
                  className={`border-2 rounded-xl p-5 transition-all cursor-pointer hover:shadow-lg ${
                    quest.completed
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => !quest.completed && setSelectedQuest(quest)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{getQuestIcon(quest.quest_type)}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{quest.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{quest.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        {quest.completed ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            Completed
                          </span>
                        ) : (
                          <>
                            <span className="bg-purple-600 text-white px-3 py-1 rounded-full font-semibold">
                              +{quest.karma_reward} Karma
                            </span>
                            <span className="text-gray-500">
                              Grade {quest.grade} • Section {quest.section}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Class Leaderboard Teaser */}
          <div className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrophyIcon className="w-8 h-8 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-900">Class Leaderboard</h3>
            </div>
            <p className="text-gray-700 text-sm mb-4">
              Your class is competing against other sections! Complete more quests to help your
              class rank higher.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-yellow-600">1st</div>
                <div className="text-xs text-gray-600">Section B</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-gray-400">2nd</div>
                <div className="text-xs text-gray-600">Section A</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-400">3rd</div>
                <div className="text-xs text-gray-600">Section C</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuestsModal;
