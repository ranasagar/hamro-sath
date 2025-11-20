import React, { useState } from 'react';
import { CloseIcon, MegaphoneIcon } from './Icons';

interface CivicNudgeModalProps {
  onClose: () => void;
  onSendNudge: (friendName: string, message: string, memeId?: number) => void;
  friends: Array<{ id: number; name: string; avatar: string }>;
}

const CivicNudgeModal: React.FC<CivicNudgeModalProps> = ({ onClose, onSendNudge, friends }) => {
  const [selectedFriend, setSelectedFriend] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedMeme, setSelectedMeme] = useState<number | null>(null);

  // Nepali-themed civic memes
  const memes = [
    {
      id: 1,
      text: "Bro, gutka on the trail? Let's keep Annapurna clean! 🗑️",
      emoji: '🏔️',
      category: 'littering',
    },
    {
      id: 2,
      text: 'Plastic in Bagmati = Karma deduct! 😱 Help keep our river clean! 💧',
      emoji: '🌊',
      category: 'river',
    },
    {
      id: 3,
      text: 'Dai/Didi, segregate waste at home! Our ward needs you! ♻️',
      emoji: '🏘️',
      category: 'segregation',
    },
    {
      id: 4,
      text: 'Use cloth bag at kirana! One less plastic = Big difference 🛍️',
      emoji: '🛒',
      category: 'plastic',
    },
    {
      id: 5,
      text: 'Your porch needs cleaning! Show ward pride 💪',
      emoji: '🏠',
      category: 'cleaning',
    },
    {
      id: 6,
      text: 'Teach one neighbor about composting today! Knowledge is karma 🌱',
      emoji: '♻️',
      category: 'education',
    },
  ];

  const handleSubmit = () => {
    if (!selectedFriend) {
      alert('Please select a friend!');
      return;
    }

    const message = selectedMeme
      ? memes.find(m => m.id === selectedMeme)?.text || customMessage
      : customMessage;

    if (!message.trim()) {
      alert('Please select a meme or write a custom message!');
      return;
    }

    onSendNudge(selectedFriend, message, selectedMeme || undefined);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-slideInUp"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <MegaphoneIcon className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Send Civic Nudge</h2>
                <p className="text-orange-100 text-sm">Fun reminders for cleaner communities</p>
              </div>
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

        <div className="p-6 space-y-6">
          {/* Select Friend */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send to (anonymous)
            </label>
            <select
              value={selectedFriend}
              onChange={e => setSelectedFriend(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none"
            >
              <option value="">Select a friend...</option>
              {friends.map(friend => (
                <option key={friend.id} value={friend.name}>
                  {friend.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Your nudge will be sent anonymously to encourage positive action!
            </p>
          </div>

          {/* Pre-made Memes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a Nepali Meme
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {memes.map(meme => (
                <div
                  key={meme.id}
                  onClick={() => setSelectedMeme(meme.id)}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                    selectedMeme === meme.id
                      ? 'border-orange-500 bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{meme.emoji}</span>
                    <p className="text-sm text-gray-700 flex-1">{meme.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or write your own message
            </label>
            <textarea
              value={customMessage}
              onChange={e => setCustomMessage(e.target.value)}
              placeholder="Write a friendly civic reminder..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          {/* Preview */}
          {(selectedMeme || customMessage) && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4">
              <p className="text-xs text-orange-700 font-semibold mb-2">PREVIEW</p>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <p className="text-sm text-gray-800">
                  {selectedMeme ? memes.find(m => m.id === selectedMeme)?.text : customMessage}
                </p>
                <p className="text-xs text-gray-500 mt-2 italic">From: Anonymous Civic Friend 😊</p>
              </div>
            </div>
          )}

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedFriend || (!selectedMeme && !customMessage.trim())}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            Send Anonymous Nudge 📨
          </button>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 How it works:</strong> Your friend receives a fun, anonymous reminder to
              take civic action. They won't know who sent it, but they'll appreciate the nudge!
              Studies show social accountability increases civic participation by 40%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivicNudgeModal;
