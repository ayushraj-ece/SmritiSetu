import React, { useState, useEffect } from 'react';
import { Volume2, Plus, CheckCircle, HelpCircle, MapPin, Trash2, Sparkles, Filter } from 'lucide-react';
import { dataService, type MemoryItem } from '../../services/dataService';
import { voiceService } from '../../services/voiceService';

interface Props {
  isCaregiverView?: boolean;
}

export const MemoryLane: React.FC<Props> = ({ isCaregiverView = false }) => {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeStoryItem, setActiveStoryItem] = useState<MemoryItem | null>(null);
  const [quizItem, setQuizItem] = useState<MemoryItem | null>(null);
  const [quizAnswerSelected, setQuizAnswerSelected] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  // Add Item Modal (Caregiver)
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string>('');
  const [newLocation, setNewLocation] = useState<string>('');
  const [newDateTag, setNewDateTag] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'family' | 'festival' | 'travel' | 'childhood'>('family');
  const [newAudioStory, setNewAudioStory] = useState<string>('');

  useEffect(() => {
    setItems(dataService.getMemoryLaneItems());
  }, []);

  const handlePlayStory = (item: MemoryItem) => {
    setActiveStoryItem(item);
    const storyText = item.audioStory || `${item.title}. ${item.description} located at ${item.location}.`;
    voiceService.speak(storyText, 'en', () => {
      setActiveStoryItem(null);
    });
  };

  const handleStopStory = () => {
    voiceService.stop();
    setActiveStoryItem(null);
  };

  const handleStartQuiz = (item: MemoryItem) => {
    setQuizItem(item);
    setQuizAnswerSelected(null);
    setQuizFeedback(null);
    if (item.quizPrompt) {
      voiceService.speak(item.quizPrompt);
    }
  };

  const handleSelectQuizAnswer = (idx: number) => {
    setQuizAnswerSelected(idx);
    if (!quizItem) return;

    const isCorrect = idx === (quizItem.correctOptionIndex ?? 0);
    if (isCorrect) {
      setQuizFeedback('Wonderful! That is exactly right. Your memory is strong today!');
      voiceService.speak('Wonderful! That is exactly right. Your memory is strong today!');
    } else {
      setQuizFeedback('That was a great attempt! Take another close look at the photo.');
      voiceService.speak('That was a great attempt! Take another close look at the photo.');
    }
  };

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      description: newDescription.trim() || 'A cherished family memory.',
      imageUrl: newImageUrl.trim() || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=800&q=80',
      location: newLocation.trim() || 'Assam, India',
      dateTag: newDateTag.trim() || 'Recent Memory',
      category: newCategory,
      audioStory: newAudioStory.trim() || `${newTitle}. A wonderful memory shared with love.`,
      quizPrompt: `What is the story behind ${newTitle}?`,
      quizOptions: [newTitle, 'Family Picnic', 'Festival Market', 'Travel Trip'],
      correctOptionIndex: 0
    };

    const updated = dataService.addMemoryLaneItem(newItem);
    setItems(updated);

    // Reset Form
    setNewTitle('');
    setNewDescription('');
    setNewImageUrl('');
    setNewLocation('');
    setNewDateTag('');
    setNewAudioStory('');
    setShowAddModal(false);
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Are you sure you want to remove this family memory from Memory Lane?')) {
      const updated = dataService.deleteMemoryLaneItem(id);
      setItems(updated);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter((i) => i.category === selectedCategory);

  return (
    <div className="space-y-8 font-sans text-[#0F172A]">
      {/* Header Banner */}
      <div className="bg-white border border-[#E2E8F0] p-6 sm:p-8 rounded-2xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#F0F9FF] border border-[#BAE6FD] text-[#0284C7] rounded-xl flex items-center justify-center text-2xl font-bold">
              🖼️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-[#0F172A]">Memory Lane Photo Album</h2>
                <span className="text-xs font-bold px-3 py-1 bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] rounded-full uppercase">
                  Reminiscence Bank
                </span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">Personalized family photos, audio life stories, and gentle recognition prompts</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCaregiverView && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Add Memory Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
          <span className="text-[#64748B] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#0284C7]" /> Filter:
          </span>
          {[
            { id: 'all', label: 'All Memories' },
            { id: 'family', label: '❤️ Family' },
            { id: 'festival', label: '🎉 Festivals' },
            { id: 'travel', label: '🌿 Travel' },
            { id: 'childhood', label: '🏡 Nostalgia' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#0284C7] text-white border-[#0284C7] shadow-xs'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F1F5F9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Photo Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const isPlaying = activeStoryItem?.id === item.id;

          return (
            <div
              key={item.id}
              className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
            >
              {/* Photo Container */}
              <div className="relative h-56 w-full overflow-hidden bg-[#F8FAFC]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-[#0F172A]/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#38BDF8]" />
                  <span>{item.location}</span>
                </div>

                <div className="absolute top-3 right-3 bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] text-[11px] font-bold px-3 py-1 rounded-full">
                  {item.dateTag}
                </div>
              </div>

              {/* Memory Details */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-xl font-extrabold text-[#0F172A] leading-snug">{item.title}</h3>
                  <p className="text-xs text-[#64748B] font-medium leading-relaxed">{item.description}</p>
                </div>

                {/* Actions Bar */}
                <div className="pt-4 border-t border-[#E2E8F0] space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => (isPlaying ? handleStopStory() : handlePlayStory(item))}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                          : 'bg-[#0284C7] hover:bg-[#0369A1] text-white border-[#0284C7] shadow-xs'
                      }`}
                    >
                      <Volume2 className="w-4 h-4 text-white" />
                      <span>{isPlaying ? 'Stop Voice Story' : 'Listen Story'}</span>
                    </button>

                    {item.quizPrompt && (
                      <button
                        onClick={() => handleStartQuiz(item)}
                        className="py-2.5 px-3 bg-[#F0F9FF] text-[#0284C7] border border-[#BAE6FD] hover:bg-[#E0F2FE] rounded-xl text-xs font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
                        title="Memory Recall Quiz"
                      >
                        <HelpCircle className="w-4 h-4 text-[#0284C7]" />
                        <span className="hidden sm:inline">Quiz</span>
                      </button>
                    )}

                    {isCaregiverView && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Memory Quiz Modal */}
      {quizItem && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl max-w-lg w-full space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0284C7]" />
                <h3 className="text-xl font-extrabold text-[#0F172A]">Memory Recall</h3>
              </div>
              <button onClick={() => setQuizItem(null)} className="text-[#64748B] hover:text-[#0F172A] font-bold text-xl cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <img src={quizItem.imageUrl} alt={quizItem.title} className="w-full h-48 object-cover rounded-xl border border-[#E2E8F0]" />
              <p className="text-lg font-bold text-[#0F172A]">{quizItem.quizPrompt}</p>

              <div className="grid grid-cols-1 gap-2.5">
                {quizItem.quizOptions?.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuizAnswer(idx)}
                    className={`p-3 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                      quizAnswerSelected === idx
                        ? idx === (quizItem.correctOptionIndex ?? 0)
                          ? 'bg-[#F0F9FF] border-[#BAE6FD] text-[#0284C7] font-bold'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#0284C7] text-[#0F172A]'
                    }`}
                  >
                    <span>{opt}</span>
                    {quizAnswerSelected === idx && idx === (quizItem.correctOptionIndex ?? 0) && (
                      <CheckCircle className="w-5 h-5 text-[#0284C7]" />
                    )}
                  </button>
                ))}
              </div>

              {quizFeedback && (
                <div className="p-3 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl text-xs font-bold text-[#0284C7]">
                  {quizFeedback}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setQuizItem(null)}
                className="px-5 py-2.5 bg-[#0284C7] text-white rounded-xl text-xs font-bold hover:bg-[#0369A1] cursor-pointer shadow-xs"
              >
                Close Exercise
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Memory Modal (Caregiver) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddMemory} className="bg-white border border-[#E2E8F0] p-6 rounded-2xl max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-xl font-extrabold text-[#0F172A]">Add Family Memory Photo</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-[#64748B] font-bold text-lg cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-medium text-[#0F172A]">
              <div>
                <label className="font-bold">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bohag Bihu Celebration"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="font-bold">Photo Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold">Location</label>
                  <input
                    type="text"
                    placeholder="Guwahati, Assam"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
                <div>
                  <label className="font-bold">Date Tag</label>
                  <input
                    type="text"
                    placeholder="April 2023"
                    value={newDateTag}
                    onChange={(e) => setNewDateTag(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none cursor-pointer"
                >
                  <option value="family">Family Gathering</option>
                  <option value="festival">Cultural Festival</option>
                  <option value="travel">Travel Trip</option>
                  <option value="childhood">Nostalgia & Childhood</option>
                </select>
              </div>

              <div>
                <label className="font-bold">Short Description</label>
                <textarea
                  rows={2}
                  placeholder="Family celebration with traditional sweets at home."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                />
              </div>

              <div>
                <label className="font-bold">Voice Story Audio Script</label>
                <textarea
                  rows={2}
                  placeholder="Spoken narrative for voice synthesis..."
                  value={newAudioStory}
                  onChange={(e) => setNewAudioStory(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl text-xs outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-[#E2E8F0] text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#0284C7] text-white border border-[#0284C7] text-xs font-bold rounded-xl hover:bg-[#0369A1] cursor-pointer shadow-xs"
              >
                Save to Memory Lane
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
